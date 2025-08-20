// src-deno/api/web_search_commands.ts
import { testWebSearchConnection } from "../services/web_search_service.ts";

export async function testWebSearchConnectionCommand(provider: string): Promise<{ success: boolean }> {
  try {
    const success = await testWebSearchConnection(provider);
    return { success };
  } catch (error) {
    console.error(`Error testing web search connection for ${provider}:`, error);
    return { success: false };
  }
}
