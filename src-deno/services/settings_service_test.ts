import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { SettingsService } from "./settings_service.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";

Deno.test("getAppSettings returns defaults when storage empty", async () => {
  const original = FileStorageClient.getInstance;
  FileStorageClient.getInstance = () => ({
    getAppSettings: () => Promise.resolve({}),
    updateAppSettings: (_: Record<string, string>) => Promise.resolve(),
  } as unknown as FileStorageClient);

  const settings = await SettingsService.getAppSettings();
  assertEquals(settings.theme, "dark");
  assertEquals(settings.language, "en");

  FileStorageClient.getInstance = original;
});
