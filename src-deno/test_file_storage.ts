// src-deno/test_file_storage.ts
import { initializeStorage } from "./init_storage.ts";
import { SettingsService } from "./services/settings_service.ts";
import { FileService } from "./services/file_service.ts";
import { KnowledgeService } from "./services/knowledge_service.ts";
import { AssistantService } from "./services/assistant_service.ts";
import { AgentService } from "./services/agent_service.ts";
import { ChatService } from "./services/chat_service.ts";
import { SecretsService } from "./services/secrets_service.ts";
import { generateUUID } from "./util/uuid.ts";

async function runTests() {
  console.log("Running file storage tests...");
  
  try {
    // Initialize storage
    await initializeStorage();
    console.log("✓ Storage initialization test passed");
    
    // Test settings service
    const settings = await SettingsService.getAppSettings();
    console.log("✓ Get app settings test passed", settings);
    
    // Test updating settings
    const updatedSettings = { ...settings, username: "Test User" };
    await SettingsService.updateAppSettings(updatedSettings);
    console.log("✓ Update app settings test passed");
    
    // Test secrets service
    await SecretsService.setSecret("test_key", "test_value");
    const secret = await SecretsService.getSecret("test_key");
    console.log("✓ Secrets service test passed", secret);
    
    // Test file service
    const file = await FileService.uploadFile("/path/to/test.txt", "test.txt");
    console.log("✓ Upload file test passed", file);
    
    const files = await FileService.listFiles();
    console.log("✓ List files test passed", files.length);
    
    // Test knowledge service
    const kb = await KnowledgeService.createKnowledgeBase(
      "Test Knowledge Base",
      "A test knowledge base",
      "text-embedding-3-small"
    );
    console.log("✓ Create knowledge base test passed", kb);
    
    const kbs = await KnowledgeService.listKnowledgeBases();
    console.log("✓ List knowledge bases test passed", kbs.length);
    
    // Test assistant service
    const assistant = await AssistantService.createAssistant({
      name: "Test Assistant",
      description: "A test assistant",
      model: "gpt-4",
      systemPrompt: "You are a helpful assistant"
    });
    console.log("✓ Create assistant test passed", assistant);
    
    const assistants = await AssistantService.listAssistants();
    console.log("✓ List assistants test passed", assistants.length);
    
    // Test updating assistant
    const updatedAssistant = await AssistantService.updateAssistant(assistant.id, {
      name: "Updated Test Assistant"
    });
    console.log("✓ Update assistant test passed", updatedAssistant);
    
    // Test agent service
    const agents = await AgentService.listAgents();
    console.log("✓ List agents test passed", agents.length);
    
    // Test chat service
    const session = await ChatService.startChatSession(assistant.id);
    console.log("✓ Start chat session test passed", session);
    
    console.log("All file storage tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runTests();
}