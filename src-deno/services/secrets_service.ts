// src-deno/services/secrets_service.ts
// This service interacts with the Tauri backend to securely store and retrieve secrets
// The actual secret storage is handled by the Rust backend using the OS keychain

export class SecretsService {
  private static isTauriAvailable: boolean = typeof window !== 'undefined' && (window as any).__TAURI__;
  
  static async getSecret(key: string): Promise<string | null> {
    try {
      if (this.isTauriAvailable) {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke('get_secret', { key });
      } else {
        // Fallback for development
        console.warn("[SECRETS] Tauri not available, cannot retrieve secret");
        return null;
      }
    } catch (error) {
      console.error(`[SECRETS] Error retrieving secret for key ${key}:`, error);
      return null;
    }
  }
  
  static async setSecret(key: string, value: string): Promise<void> {
    try {
      if (this.isTauriAvailable) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_secret', { key, value });
      } else {
        // Fallback for development
        console.warn("[SECRETS] Tauri not available, cannot store secret");
      }
    } catch (error) {
      console.error(`[SECRETS] Error setting secret for key ${key}:`, error);
      throw error;
    }
  }
  
  static async loadSecrets(): Promise<void> {
    // In a real implementation, secrets are loaded on demand, not all at once
    console.log("[SECRETS] Secrets are loaded on demand from OS keychain");
  }
  
  static async saveSecrets(): Promise<void> {
    // In a real implementation, secrets are saved immediately when set
    console.log("[SECRETS] Secrets are saved immediately to OS keychain");
  }
}