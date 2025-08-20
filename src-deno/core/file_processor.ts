// src-deno/core/file_processor.ts
import { LLMFactory } from "../lib/llm_factory.ts";
import { emitEventToFrontend } from "../tauri_bridge.ts";
import { QdrantClient } from "../db/qdrant_client.ts";
import { SettingsService } from "../services/settings_service.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";
import { parsePdfContent } from "../lib/pdf/pdf_parser.ts";

// Text splitter implementation
class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(
    options: {
      chunkSize?: number;
      chunkOverlap?: number;
      separators?: string[];
    },
  ) {
    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.separators = options.separators || ["\n\n", "\n", " ", ""];
  }

  async splitText(text: string): Promise<string[]> {
    return this.splitTextRecursive(text, this.separators);
  }

  private async splitTextRecursive(
    text: string,
    separators: string[],
  ): Promise<string[]> {
    // If text is short enough, return as is
    if (text.length <= this.chunkSize) {
      return [text];
    }

    const finalChunks: string[] = [];
    let separator = separators[separators.length - 1]; // Default to character-level split

    // Find the best separator to split on
    for (const sep of separators) {
      if (text.includes(sep)) {
        separator = sep;
        break;
      }
    }

    // Split the text using the chosen separator
    const splits = text.split(separator);
    let currentChunk = "";

    for (const split of splits) {
      const prospectiveChunk = currentChunk
        ? currentChunk + separator + split
        : split;

      if (prospectiveChunk.length > this.chunkSize) {
        // If we have a current chunk, add it to final chunks
        if (currentChunk) {
          finalChunks.push(currentChunk);
        }

        // If the prospective chunk is still too large, recursively split it
        if (prospectiveChunk.length > this.chunkSize) {
          const recursiveChunks = await this.splitTextRecursive(
            prospectiveChunk,
            separators.slice(1),
          );
          finalChunks.push(...recursiveChunks);
          currentChunk = "";
        } else {
          currentChunk = prospectiveChunk;
        }
      } else {
        currentChunk = prospectiveChunk;
      }
    }

    // Add the last chunk if it exists
    if (currentChunk) {
      finalChunks.push(currentChunk);
    }

    // Handle overlap between chunks
    if (this.chunkOverlap > 0) {
      return this.handleOverlap(finalChunks);
    }

    return finalChunks;
  }

  private handleOverlap(chunks: string[]): string[] {
    if (chunks.length <= 1) {
      return chunks;
    }

    const overlappedChunks: string[] = [chunks[0]];

    for (let i = 1; i < chunks.length; i++) {
      const prevChunk = overlappedChunks[overlappedChunks.length - 1];
      const currentChunk = chunks[i];

      // Find a good overlap point (try to break at sentence or word boundaries)
      let overlapPoint = Math.min(this.chunkOverlap, prevChunk.length);

      // Try to find a better overlap point at a sentence or word boundary
      for (let j = 0; j < this.separators.length; j++) {
        const sep = this.separators[j];
        const lastPart = prevChunk.slice(-overlapPoint);
        const lastSepIndex = lastPart.lastIndexOf(sep);

        if (lastSepIndex > 0) {
          overlapPoint = overlapPoint - lastPart.length + lastSepIndex +
            sep.length;
          break;
        }
      }

      const overlappedChunk = prevChunk.slice(-overlapPoint) + currentChunk;
      overlappedChunks.push(overlappedChunk);
    }

    return overlappedChunks;
  }
}

// Progress tracking for file processing
interface ProcessingProgress {
  status: "PROCESSING" | "INDEXING" | "COMPLETED" | "ERROR";
  progress: number;
  message: string;
}

export async function processAndEmbedFile(fileId: string, kbId: string) {
  const startTime = Date.now();
  console.log(
    `Starting file processing for file ${fileId} in knowledge base ${kbId}`,
  );

  let errorHandled = false;

  try {
    // 1. Get file and knowledge base info from storage
    const fileStorage = FileStorageClient.getInstance();
    const file = await fileStorage.getFile(fileId);
    if (!file) {
      throw new Error(`File with ID ${fileId} not found`);
    }

    const kb = await FileStorageClient.getInstance().getKnowledgeBase(kbId);
    if (!kb) {
      throw new Error(`Knowledge base with ID ${kbId} not found`);
    }

    if (!kb.vectorSize) {
      const message = `Knowledge base ${kbId} is missing vector size`;
      await fileStorage.updateFileStatus(fileId, "ERROR");
      emitProgressUpdate(fileId, { status: "ERROR", progress: 0, message });
      errorHandled = true;
      throw new Error(message);
    }

    if (!kb.embeddingModel) {
      const message = `Knowledge base ${kbId} is missing embedding model`;
      await fileStorage.updateFileStatus(fileId, "ERROR");
      emitProgressUpdate(fileId, { status: "ERROR", progress: 0, message });
      errorHandled = true;
      throw new Error(message);
    }

    console.log(`Processing file: ${file.name} (${file.mimeType})`);

    // Update file status
    await fileStorage.updateFileStatus(fileId, "PROCESSING");
    emitProgressUpdate(fileId, {
      status: "PROCESSING",
      progress: 0,
      message: "Processing file...",
    });

    // 2. Read file content
    let text: string;
    if (file.mimeType === "application/pdf") {
      emitProgressUpdate(fileId, {
        status: "PROCESSING",
        progress: 10,
        message: "Parsing PDF content...",
      });
      console.log("Parsing PDF content...");
      try {
        text = await parsePdfContent(file.path);
        console.log(
          `PDF parsing completed, extracted ${text.length} characters`,
        );
      } catch (pdfError: any) {
        console.error("Error parsing PDF:", pdfError);
        throw new Error(`Failed to parse PDF file: ${pdfError.message}`);
      }
    } else {
      // For text files, read directly
      emitProgressUpdate(fileId, {
        status: "PROCESSING",
        progress: 10,
        message: "Reading text content...",
      });
      console.log("Reading text content...");
      try {
        const fileData = await Deno.readTextFile(file.path);
        text = fileData;
        console.log(
          `Text reading completed, extracted ${text.length} characters`,
        );
      } catch (readError: any) {
        console.error("Error reading text file:", readError);
      } catch (readError: unknown) {
        console.error("Error reading text file:", readError);
        let errorMessage = "Unknown error";
        if (readError && typeof readError === "object" && "message" in readError && typeof (readError as any).message === "string") {
          errorMessage = (readError as { message: string }).message;
        }
        throw new Error(`Failed to read text file: ${errorMessage}`);
      }
    }

    // 3. Split text into manageable chunks
    emitProgressUpdate(fileId, {
      status: "PROCESSING",
      progress: 30,
      message: "Splitting text into chunks...",
    });
    console.log("Splitting text into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitText(text);

    if (chunks.length === 0) {
      throw new Error("No text content found in file");
    }

    console.log(`Text splitting completed, created ${chunks.length} chunks`);

    // 4. Generate embeddings for chunks
    emitProgressUpdate(fileId, {
      status: "INDEXING",
      progress: 50,
      message: `Generating embeddings for ${chunks.length} chunks...`,
    });
    console.log(
      `Generating embeddings for ${chunks.length} chunks using model: ${kb.embeddingModel}`,
    );

    // Use the LLM factory to get the appropriate client based on the embedding model
    const llmClient = await LLMFactory.getClientForModel(kb.embeddingModel);

    // Generate embeddings in batches to avoid rate limits
    const batchSize = 10;
    const embeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(
        `Generating embeddings for batch ${Math.floor(i / batchSize) + 1} of ${
          Math.ceil(chunks.length / batchSize)
        }`,
      );

      try {
        const batchEmbeddings = await llmClient.generateEmbeddings(
          batch,
          kb.embeddingModel,
        );
        embeddings.push(...batchEmbeddings);
      } catch (embeddingError: any) {
        console.error(
          `Error generating embeddings for batch ${
            Math.floor(i / batchSize) + 1
          }:`,
          embeddingError,
        );
        throw new Error(
          `Failed to generate embeddings: ${embeddingError.message}`,
        );
      }

      // Update progress
      const progress = 50 + Math.floor((i / chunks.length) * 30);
      emitProgressUpdate(fileId, {
        status: "INDEXING",
        progress,
        message: `Generated embeddings for ${
          Math.min(i + batchSize, chunks.length)
        } of ${chunks.length} chunks...`,
      });

      // Small delay between batches to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log(
      `Embedding generation completed for all ${chunks.length} chunks`,
    );

    // 5. Format data for Qdrant and upsert
    emitProgressUpdate(fileId, {
      status: "INDEXING",
      progress: 80,
      message: "Preparing data for vector database...",
    });
    console.log("Preparing data for vector database...");

    const points = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(), // Qdrant point ID
      vector: embeddings[index],
      payload: {
        content: chunk,
        file_id: fileId,
        file_name: file.name,
        chunk_index: index,
      },
    }));

    console.log(`Prepared ${points.length} points for vector database`);

    // Get Qdrant configuration from settings
    const settings = await SettingsService.getAppSettings();
    const qdrantClient = new QdrantClient(
      settings.qdrantUrl,
      settings.qdrantApiKey || "",
    );

    // Ensure the collection exists
    const collectionName = `knowledge_base_${kbId}`;
    const collectionExists = await qdrantClient.collectionExists(
      collectionName,
    );
    if (!collectionExists) {
      console.log(`Creating Qdrant collection: ${collectionName}`);
      await qdrantClient.createCollection(collectionName, kb.vectorSize);
    }

    // Upsert points to Qdrant
    emitProgressUpdate(fileId, {
      status: "INDEXING",
      progress: 90,
      message: `Indexing ${points.length} chunks in vector database...`,
    });
    console.log(`Indexing ${points.length} chunks in vector database...`);
    try {
      await qdrantClient.upsertPoints(collectionName, points);
    } catch (qdrantError: any) {
      console.error("Error upserting points to Qdrant:", qdrantError);
      throw new Error(
        `Failed to index chunks in vector database: ${qdrantError.message}`,
      );
    }

    // 6. Finalize status
    await fileStorage.updateFileStatus(fileId, "INDEXED");
    emitProgressUpdate(fileId, {
      status: "COMPLETED",
      progress: 100,
      message: "File processing completed successfully!",
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `File processing completed for ${fileId} in knowledge base ${kbId} in ${totalTime}ms`,
    );
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(
      `Error processing file (completed in ${totalTime}ms):`,
      error,
    );

    if (!errorHandled) {
      // Update status to error
      try {
        const fileStorage = FileStorageClient.getInstance();
        await fileStorage.updateFileStatus(fileId, "ERROR");
        emitProgressUpdate(fileId, {
          status: "ERROR",
          progress: 0,
          message: `Error: ${(error as Error).message}`,
        });
      } catch (statusError: unknown) {
        console.error("Failed to update file status to ERROR:", statusError);
      }
    }

    throw error;
  }
}

// Helper function to emit progress updates
function emitProgressUpdate(fileId: string, progress: ProcessingProgress) {
  emitEventToFrontend("file-processing-progress", {
    fileId,
    status: progress.status,
    progress: progress.progress,
    message: progress.message,
  });
}
