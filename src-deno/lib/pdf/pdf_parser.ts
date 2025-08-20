// src-deno/lib/pdf/pdf_parser.ts
// Enhanced PDF text extraction using a more robust approach

export async function parsePdfContent(filePath: string): Promise<string> {
  try {
    // Read the PDF file as binary data
    const pdfData = await Deno.readFile(filePath);
    
    // Convert to string for processing
    const pdfText = new TextDecoder().decode(pdfData);
    
    // Enhanced text extraction that handles more PDF formats
    let extractedText = "";
    
    // Method 1: Extract text between parentheses (basic PDF text format)
    const textMatches = pdfText.match(/\([^)]+\)/g);
    if (textMatches && textMatches.length > 0) {
      // Clean up the extracted text
      const method1Text = textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .map(text => text.replace(/\\n/g, " ")) // Replace escaped newlines
        .map(text => text.replace(/\\t/g, " ")) // Replace escaped tabs
        .map(text => text.replace(/\\r/g, " ")) // Replace escaped carriage returns
        .map(text => text.replace(/\\(.)/g, "$1")) // Handle other escaped characters
        .join(" ");
      
      extractedText += method1Text + " ";
    }
    
    // Method 2: Extract text between BT and ET markers (begin/end text)
    const btEtSections = pdfText.match(/BT[\s\S]*?ET/g);
    if (btEtSections && btEtSections.length > 0) {
      // Extract text between parentheses within BT/ET blocks
      const method2Text = btEtSections
        .map(block => {
          const textMatches = block.match(/\([^)]+\)/g);
          return textMatches ? textMatches.map(match => match.slice(1, -1)).join(" ") : "";
        })
        .filter(text => text.length > 0)
        .join(" ");
      
      extractedText += method2Text + " ";
    }
    
    // Method 3: Extract text from Tf (text font) commands
    const tfSections = pdfText.match(/Tf[\s\S]*?Tj/g);
    if (tfSections && tfSections.length > 0) {
      // Extract text between parentheses in Tf sections
      const method3Text = tfSections
        .map(section => {
          const textMatches = section.match(/\([^)]+\)/g);
          return textMatches ? textMatches.map(match => match.slice(1, -1)).join(" ") : "";
        })
        .filter(text => text.length > 0)
        .join(" ");
      
      extractedText += method3Text + " ";
    }
    
    // Method 4: Extract content from content streams
    const contentStreams = pdfText.match(/\/Contents\s+[\d\s]+R[\s\S]*?stream[\s\S]*?endstream/g);
    if (contentStreams && contentStreams.length > 0) {
      const method4Text = contentStreams
        .map(stream => {
          // Extract text between parentheses in content streams
          const textMatches = stream.match(/\([^)]+\)/g);
          return textMatches ? textMatches.map(match => match.slice(1, -1)).join(" ") : "";
        })
        .filter(text => text.length > 0)
        .join(" ");
      
      extractedText += method4Text + " ";
    }
    
    // If we couldn't extract text using the above methods, try a fallback approach
    if (!extractedText.trim()) {
      // Remove binary data and extract readable text
      let cleanText = pdfText;
      
      // Remove stream objects that contain binary data
      cleanText = cleanText.replace(/stream[\s\S]*?endstream/g, "");
      
      // Remove xref and trailer sections
      cleanText = cleanText.replace(/xref[\s\S]*?trailer/g, "");
      cleanText = cleanText.replace(/startxref[\s\S]*?%%EOF/g, "");
      
      // Remove object definitions
      cleanText = cleanText.replace(/[\d\s]+obj[\s\S]*?endobj/g, "");
      
      // Extract sequences of readable characters
      const readableMatches = cleanText.match(/[a-zA-Z0-9\s\.\,\!\?\;\:]+/g);
      if (readableMatches) {
        extractedText = readableMatches.join(" ");
      } else {
        // Final fallback: keep only alphanumeric and basic punctuation
        extractedText = cleanText
          .replace(/[^a-zA-Z0-9\s\.\,\!\?\;\:]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
    
    // Clean up the final text
    return extractedText
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  } catch (error) {
    console.error("Error parsing PDF content:", error);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
}