// src-deno/lib/pdf/pdf_parser.ts
// PDF text extraction using a library for improved reliability

import pdfParse from "pdf-parse";
import { Buffer } from "node:buffer";

export async function parsePdfContent(filePath: string): Promise<string> {
  try {
    // Read the PDF file as binary data
    const data = await Deno.readFile(filePath);
    const buffer = Buffer.from(data);

    // Use the pdf-parse library to extract text
    const result = (await pdfParse(buffer)) as { text: string };

    if (!result.text) {
      throw new Error("No text found in PDF");
    }

    return result.text.trim();
  } catch (error: unknown) {
    console.error("Error parsing PDF content:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse PDF file: ${message}`);
  }
}
