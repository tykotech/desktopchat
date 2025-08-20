// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use std::process::Command;
use std::sync::Mutex;
use tauri::Manager;

#[cfg(windows)]
fn normalize_path(path: &str) -> String {
    path.replace("\\", "/")
}

#[cfg(target_os = "windows")]
fn normalize_path(path: &str) -> String {
    path.replace("\\", "/")
}

#[cfg(not(target_os = "windows"))]
fn normalize_path(path: &str) -> String {
use std::path::Path;

#[cfg(windows)]
fn normalize_path(path: &str) -> String {
    let p = Path::new(path);
    // Convert to string, then replace backslashes with forward slashes for consistency
    p.to_string_lossy().replace("\\", "/")
}

#[cfg(target_os = "windows")]
fn normalize_path(path: &str) -> String {
    path.replace("\\", "/")
}

#[cfg(not(target_os = "windows"))]
fn normalize_path(path: &str) -> String {
    let p = Path::new(path);
    p.to_string_lossy().to_string()
}

struct DenoBackend {
    process: Option<std::process::Child>,
}

impl DenoBackend {
    fn new() -> Self {
        Self { process: None }
    }

    fn start(&mut self) -> Result<(), String> {
        // Start the Deno backend process
        let mut cmd = Command::new("deno");
        cmd.arg("run");
        cmd.arg("--allow-all");
        cmd.arg("--unstable");
        cmd.arg("src-deno/main.ts");

        match cmd.spawn() {
            Ok(child) => {
                self.process = Some(child);
                Ok(())
            }
            Err(e) => Err(format!(
                "Failed to start Deno backend: {} (make sure Deno is installed and in PATH)",
                e
            )),
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_stronghold::Builder::new(|_key| vec![0; 32]).build())
        .setup(|app| {
            // Initialize and start the Deno backend
            let mut deno_backend = DenoBackend::new();
            if let Err(e) = deno_backend.start() {
                eprintln!("Error starting Deno backend: {}", e);
            }

            // Store the backend handle in app state if needed
            app.manage(Mutex::new(deno_backend));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Settings commands
            get_app_settings,
            update_app_settings,
            get_secret,
            set_secret,
            // Files & Knowledge Bases commands
            list_files,
            upload_file,
            delete_file,
            create_knowledge_base,
            list_knowledge_bases,
            add_file_to_knowledge_base,
            list_knowledge_base_files,
            remove_file_from_knowledge_base,
            delete_knowledge_base,
            // Assistants & Agents commands
            create_assistant,
            list_assistants,
            update_assistant,
            delete_assistant,
            get_assistant,
            list_agents,
            // Chat commands
            start_chat_session,
            send_message,
            list_chat_sessions,
            get_session_messages
            // Qdrant commands
            test_qdrant_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Helper function to make HTTP requests to the Deno backend
async fn call_deno_backend(
    endpoint: &str,
    method: &str,
    body: Option<Value>,
) -> Result<String, String> {
    // Give the Deno backend a moment to start
    tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;

    let url = format!("http://localhost:8000{}", endpoint);

    let client = reqwest::Client::new();

    let response = match method {
        "GET" => client.get(&url).send().await,
        "POST" => {
            let mut request = client.post(&url);
            if let Some(data) = body {
                request = request.json(&data);
            }
            request.send().await
        }
        "PUT" => {
            let mut request = client.put(&url);
            if let Some(data) = body {
                request = request.json(&data);
            }
            request.send().await
        }
        "DELETE" => client.delete(&url).send().await,
        _ => return Err("Unsupported HTTP method".to_string()),
    };

    match response {
        Ok(resp) => {
            let status = resp.status();
            let text = resp
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {} (status: {})", e, status))?;

            if status.is_success() {
                Ok(text)
            } else {
                Err(format!("HTTP error {}: {}", status, text))
            }
        }
        Err(e) => Err(format!("Request failed: {} (url: {})", e, url)),
    }
}

// Settings commands
#[tauri::command]
async fn get_app_settings() -> Result<String, String> {
    call_deno_backend("/api/settings", "GET", None).await
}

#[tauri::command]
async fn update_app_settings(settings: &str) -> Result<(), String> {
    let json: Value = serde_json::from_str(settings)
        .map_err(|e| format!("Invalid JSON: {} (input: {})", e, settings))?;
    call_deno_backend("/api/settings", "POST", Some(json))
        .await
        .map(|_| ())
}

#[tauri::command]
async fn get_secret(_key: &str) -> Result<Option<String>, String> {
    // For now, we'll just return None since we're not implementing the stronghold integration fully
    // In a real implementation, you would use the stronghold API to retrieve secrets
    Ok(None)
}

#[tauri::command]
async fn set_secret(_key: &str, _value: &str) -> Result<(), String> {
    // For now, we'll just return Ok(()) since we're not implementing the stronghold integration fully
    // In a real implementation, you would use the stronghold API to store secrets
    Ok(())
}

// Qdrant commands
#[tauri::command]
async fn test_qdrant_connection(
    qdrant_url: &str,
    qdrant_api_key: Option<&str>,
) -> Result<bool, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/", qdrant_url.trim_end_matches('/'));
    let mut request = client.get(&url);
    if let Some(key) = qdrant_api_key {
        request = request.header("api-key", key);
    }
    match request.send().await {
        Ok(resp) => Ok(resp.status().is_success()),
        Err(_) => Err("Failed to connect to Qdrant. Please check your URL and API key.".to_string()),
    }
}

// Files & Knowledge Bases commands
#[tauri::command]
async fn list_files() -> Result<String, String> {
    call_deno_backend("/api/files", "GET", None).await
}

#[tauri::command]
async fn upload_file(file_path: &str, file_name: &str) -> Result<String, String> {
    let body = serde_json::json!({
        "filePath": normalize_path(file_path),
        "fileName": file_name
    });
    call_deno_backend("/api/files", "POST", Some(body)).await
}

#[tauri::command]
async fn delete_file(file_id: &str) -> Result<(), String> {
    let endpoint = format!("/api/files/{}", file_id);
    call_deno_backend(&endpoint, "DELETE", None)
        .await
        .map(|_| ())
}

#[tauri::command]
async fn create_knowledge_base(
    name: &str,
    description: &str,
    embedding_model: &str,
) -> Result<String, String> {
    let body = serde_json::json!({
        "name": name,
        "description": description,
        "embeddingModel": embedding_model
    });
    call_deno_backend("/api/knowledge-bases", "POST", Some(body)).await
}

#[tauri::command]
async fn list_knowledge_bases() -> Result<String, String> {
    call_deno_backend("/api/knowledge-bases", "GET", None).await
}

#[tauri::command]
async fn add_file_to_knowledge_base(kb_id: &str, file_id: &str) -> Result<(), String> {
    let body = serde_json::json!({
        "kbId": kb_id,
        "fileId": file_id
    });
    call_deno_backend("/api/knowledge-bases/add-file", "POST", Some(body))
        .await
        .map(|_| ())
}

#[tauri::command]
async fn list_knowledge_base_files(kb_id: &str) -> Result<String, String> {
    let endpoint = format!("/api/knowledge-bases/{}/files", kb_id);
    call_deno_backend(&endpoint, "GET", None).await
}

#[tauri::command]
async fn remove_file_from_knowledge_base(kb_id: &str, file_id: &str) -> Result<(), String> {
    let endpoint = format!("/api/knowledge-bases/{}/files/{}", kb_id, file_id);
    call_deno_backend(&endpoint, "DELETE", None).await.map(|_| ())
}

#[tauri::command]
async fn delete_knowledge_base(kb_id: &str) -> Result<(), String> {
    let endpoint = format!("/api/knowledge-bases/{}", kb_id);
    call_deno_backend(&endpoint, "DELETE", None).await.map(|_| ())
}

// Assistants & Agents commands
#[tauri::command]
async fn create_assistant(
    name: &str,
    description: &str,
    model: &str,
    system_prompt: &str,
) -> Result<String, String> {
    let body = serde_json::json!({
        "name": name,
        "description": description,
        "model": model,
        "systemPrompt": system_prompt,
        "knowledgeBaseIds": knowledge_base_ids.unwrap_or_default()
    });
    call_deno_backend("/api/assistants", "POST", Some(body)).await
}

#[tauri::command]
async fn list_assistants() -> Result<String, String> {
    call_deno_backend("/api/assistants", "GET", None).await
}

#[tauri::command]
async fn update_assistant(
    assistant_id: &str,
    name: Option<&str>,
    description: Option<&str>,
    model: Option<&str>,
    system_prompt: Option<&str>,
) -> Result<String, String> {
    let mut config = serde_json::Map::new();
    if let Some(n) = name {
        config.insert("name".to_string(), serde_json::Value::String(n.to_string()));
    }
    if let Some(d) = description {
        config.insert(
            "description".to_string(),
            serde_json::Value::String(d.to_string()),
        );
    }
    if let Some(m) = model {
        config.insert(
            "model".to_string(),
            serde_json::Value::String(m.to_string()),
        );
    }
    if let Some(s) = system_prompt {
        config.insert(
            "systemPrompt".to_string(),
            serde_json::Value::String(s.to_string()),
        );
    }
    if let Some(kb_ids) = knowledge_base_ids {
        config.insert(
            "knowledgeBaseIds".to_string(),
            serde_json::Value::Array(kb_ids.into_iter().map(|id| serde_json::Value::String(id)).collect()),
        );
    }

    let body = serde_json::Value::Object(config);
    let endpoint = format!("/api/assistants/{}", assistant_id);
    call_deno_backend(&endpoint, "PUT", Some(body)).await
}

#[tauri::command]
async fn delete_assistant(assistant_id: &str) -> Result<(), String> {
    let endpoint = format!("/api/assistants/{}", assistant_id);
    call_deno_backend(&endpoint, "DELETE", None)
        .await
        .map(|_| ())
}

#[tauri::command]
async fn get_assistant(assistant_id: &str) -> Result<String, String> {
    let endpoint = format!("/api/assistants/{}", assistant_id);
    call_deno_backend(&endpoint, "GET", None).await
}

#[tauri::command]
async fn list_agents() -> Result<String, String> {
    call_deno_backend("/api/agents", "GET", None).await
}

// Chat commands
#[tauri::command]
async fn start_chat_session(assistant_id: &str) -> Result<String, String> {
    let body = serde_json::json!({
        "assistantId": assistant_id
    });
    call_deno_backend("/api/chat/sessions", "POST", Some(body)).await
}

#[tauri::command]
async fn send_message(session_id: &str, content: &str) -> Result<String, String> {
    let body = serde_json::json!({
        "message": {
            "content": content,
            "role": "user"
        }
    });
    let endpoint = format!("/api/chat/sessions/{}", session_id);
    call_deno_backend(&endpoint, "POST", Some(body)).await
}

#[tauri::command]
async fn list_chat_sessions() -> Result<String, String> {
    call_deno_backend("/api/chat/sessions", "GET", None).await
}

#[tauri::command]
async fn get_session_messages(session_id: &str) -> Result<String, String> {
    let endpoint = format!("/api/chat/sessions/{}/messages", session_id);
    call_deno_backend(&endpoint, "GET", None).await
}
