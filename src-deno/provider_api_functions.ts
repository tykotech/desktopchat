// Adding provider service functions to main.ts
import { ProviderService } from "./services/provider_service.ts";

// Add these functions to the main.ts file

export async function testProviderConnection(providerId: string): Promise<boolean> {
  return await ProviderService.testConnection(providerId);
}

export async function listProviderModels(providerId: string): Promise<any[]> {
  const models = await ProviderService.listAvailableModels(providerId);
  return models;
}

export async function getProviderConfig(providerId: string): Promise<any> {
  const config = await ProviderService.getProviderConfig(providerId);
  return config;
}

// Add these routes to the HTTP server in main.ts

// if (path === "/api/providers/:providerId/test" && method === "POST") {
//   const providerId = path.split("/")[3];
//   const success = await testProviderConnection(providerId);
//   return new Response(JSON.stringify({ success }), {
//     headers: setCORSHeaders(origin),
//   });
// }

// if (path === "/api/providers/:providerId/models" && method === "GET") {
//   const providerId = path.split("/")[3];
//   const models = await listProviderModels(providerId);
//   return new Response(JSON.stringify(models), {
//     headers: setCORSHeaders(origin),
//   });
// }

// if (path === "/api/providers/:providerId/config" && method === "GET") {
//   const providerId = path.split("/")[3];
//   const config = await getProviderConfig(providerId);
//   return new Response(JSON.stringify(config), {
//     headers: setCORSHeaders(origin),
//   });
// }