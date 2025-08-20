// src-deno/core/rag_pipeline.ts
import { LLMFactory } from "../lib/llm_factory.ts";
import { emitEventToFrontend } from "../tauri_bridge.ts";
import { QdrantClient } from "../db/qdrant_client.ts";
import { SettingsService } from "../services/settings_service.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";
import { WebSearchService } from "../services/web_search_service.ts";
import { ChatMessage } from "../db/schema.ts";

interface SearchResult {
  payload: { content: string };
}

// Helper function to build prompt with context
function buildPromptWithContext(
  systemPrompt: string,
  chatHistory: ChatMessage[],
  userMessage: string,
  context: string,
  webResults?: { title: string; url: string; snippet: string }[],
): string {
  let prompt = "";

  if (systemPrompt) {
    prompt += `${systemPrompt}\n\n`;
  }

  if (context && context !== "No relevant context found.") {
    prompt += `Context:\n${context}\n\n`;
  }

  // Add web search results if available
  if (webResults && webResults.length > 0) {
    prompt += "Web Search Results:\n";
    webResults.forEach((result, index) => {
      prompt += `${
        index + 1
      }. ${result.title}\n   ${result.snippet}\n   Source: ${result.url}\n\n`;
    });
    prompt += "\n";
  }

  // Add recent chat history (last 10 messages to avoid overly long prompts)
  const recentHistory = chatHistory.slice(-10);
  for (const message of recentHistory) {
    prompt += `${message.role}: ${message.content}\n`;
  }

  // Add current user message
  prompt += `user: ${userMessage}\nassistant: `;

  return prompt;
}

// Helper function to extract keywords from a query for web search
function extractKeywords(query: string): string {
  // Simple keyword extraction - remove common words and punctuation
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word))
    .join(" ");
}

export async function executeRagPipeline(
  sessionId: string,
  userMessage: string,
) {
  const startTime = Date.now();
  console.log(`Starting RAG pipeline for session ${sessionId}`);

  try {
    const fileStorage = FileStorageClient.getInstance();

    // 1. Retrieve session, assistant, and associated knowledge bases
    const session = await fileStorage.getChatSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const assistant = await fileStorage.getAssistant(session.assistantId);
    if (!assistant) {
      throw new Error(`Assistant with ID ${session.assistantId} not found`);
    }

    console.log(`Assistant: ${assistant.name} (${assistant.model})`);

    // Get knowledge bases associated with this assistant
    const kbIds = await fileStorage.getAssistantKnowledgeBases(assistant.id);
    const knowledgeBases = [];
    for (const kbId of kbIds) {
      const kb = await fileStorage.getKnowledgeBase(kbId);
      if (!kb) {
        throw new Error(`Knowledge base with ID ${kbId} not found`);
      }
      knowledgeBases.push(kb);
    }

    console.log(`Found ${knowledgeBases.length} knowledge bases for assistant`);

    // 2. If knowledge bases are attached, perform vector search
    let context = "";
    let searchResults: SearchResult[] = [];

    if (knowledgeBases.length > 0) {
      try {
        console.log("Performing vector search in knowledge bases...");
        const searchStartTime = Date.now();

        // Get settings for Qdrant configuration
        const settings = await SettingsService.getAppSettings();

        // Get the embedding model from the first knowledge base
        const embeddingModel = knowledgeBases[0].embeddingModel;
        console.log(`Using embedding model: ${embeddingModel}`);

        // Use the LLM factory to get the appropriate client based on the embedding model
        const embeddingClient = await LLMFactory.getClientForModel(
          embeddingModel,
        );

        // Generate embedding for the user's query
        const queryEmbeddings = await embeddingClient.generateEmbeddings([
          userMessage,
        ], embeddingModel);
        const queryEmbedding = queryEmbeddings[0];

        // Search relevant chunks in Qdrant across all associated collections
        const qdrantClient = new QdrantClient(
          settings.qdrantUrl,
          settings.qdrantApiKey || "",
        );

        searchResults = await qdrantClient.searchCollections(
          knowledgeBases.map((kb) => `knowledge_base_${kb.id}`),
          queryEmbedding,
          { limit: 10 },
        );

        // Format context for the final prompt
        context = searchResults.map((result) => result.payload.content).join(
          "\n\n",
        );

        const searchTime = Date.now() - searchStartTime;
        console.log(
          `Vector search completed in ${searchTime}ms, found ${searchResults.length} results`,
        );
      } catch (error: unknown) {
        console.warn(
          "Failed to search Qdrant, continuing without context:",
          error,
        );
        context = "No relevant context found.";
      }
    }

    // 3. Perform web search if no relevant context found or if web search is enabled
    let webResults:
      | { title: string; url: string; snippet: string }[]
      | undefined;

    try {
      // Check if we should perform web search
      // This could be based on settings or the quality of the retrieved context
      const shouldWebSearch = context === "No relevant context found." ||
        searchResults.length < 3;

      if (shouldWebSearch) {
        console.log("Performing web search...");
        const webSearchStartTime = Date.now();

        // Extract keywords from the user message for web search
        const keywords = extractKeywords(userMessage);
        if (keywords) {
          webResults = await WebSearchService.search(keywords, undefined, 5);
          const webSearchTime = Date.now() - webSearchStartTime;
          console.log(
            `Web search completed in ${webSearchTime}ms, found ${webResults.length} results`,
          );
        }
      }
    } catch (error: unknown) {
      console.warn("Web search failed, continuing without web results:", error);
    }

    // 4. Construct the final prompt
    console.log("Building final prompt...");
    const chatHistory = await fileStorage.getMessagesForSession(sessionId);
    const finalPrompt = buildPromptWithContext(
      assistant.systemPrompt,
      chatHistory,
      userMessage,
      context,
      webResults,
    );

    if (context && context !== "No relevant context found.") {
      // Limit the search to the last 20 messages for efficiency
      const recentMessages = chatHistory.slice(-20);
      const contextExists = recentMessages.some(
        (message) =>
          message.role === "assistant" &&
          message.content === `[Context]\n${context}`,
      );
      if (!contextExists) {
        await fileStorage.saveMessage({
          id: crypto.randomUUID(),
          sessionId,
          role: "assistant",
          message.content === formatContextMessage(context),
      );
      if (!contextExists) {
        await fileStorage.saveMessage({
          id: crypto.randomUUID(),
          sessionId,
          role: "assistant",
          content: formatContextMessage(context),
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Log prompt size for debugging (but not the full prompt for security)
    console.log(`Final prompt size: ${finalPrompt.length} characters`);

    // 5. Get the appropriate LLM client for chat completion
    console.log(`Generating response with model: ${assistant.model}`);
    const generationStartTime = Date.now();

    // Use the LLM factory to get the appropriate client based on the chat model
    const chatClient = await LLMFactory.getClientForModel(assistant.model);

    // Get settings for temperature and max tokens
    const settings = await SettingsService.getAppSettings();

    // Stream the response
    const responseStream = chatClient.streamChatCompletion({
      prompt: finalPrompt,
      model: assistant.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    });

    // 6. Forward stream chunks to the frontend via Tauri events
    let fullResponse = "";
    let chunkCount = 0;

    for await (const chunk of responseStream) {
      emitEventToFrontend(`chat-stream-chunk-${sessionId}`, {
        content: chunk.content,
      });
      fullResponse += chunk.content;
      chunkCount++;

      // Send progress updates every 10 chunks
      if (chunkCount % 10 === 0) {
        console.log(`Generated ${chunkCount} chunks so far...`);
      }
    }

    const generationTime = Date.now() - generationStartTime;
    console.log(
      `Response generation completed in ${generationTime}ms with ${chunkCount} chunks`,
    );

    // 7. Save messages to the database
    console.log("Saving messages to database...");
    const userMessageRecord = {
      id: crypto.randomUUID(),
      sessionId: sessionId,
      role: "user" as "user" | "assistant",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    const assistantMessageRecord = {
      id: crypto.randomUUID(),
      sessionId: sessionId,
      role: "assistant" as "user" | "assistant",
      content: fullResponse,
      createdAt: new Date().toISOString(),
    };

    await fileStorage.saveMessage(userMessageRecord);
    await fileStorage.saveMessage(assistantMessageRecord);

    const totalTime = Date.now() - startTime;
    console.log(
      `RAG pipeline completed for session ${sessionId} in ${totalTime}ms`,
    );
  } catch (error: unknown) {
    const totalTime = Date.now() - startTime;
    console.error(
      `Error in RAG pipeline (completed in ${totalTime}ms):`,
      error,
    );

    // Send error message to frontend
    emitEventToFrontend(`chat-stream-error-${sessionId}`, {
      error:
        "An error occurred while processing your request. Please try again.",
    });

    throw error;
  }
}
