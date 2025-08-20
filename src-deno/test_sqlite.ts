// src-deno/test_sqlite.ts
import { SqliteClient } from "./db/sqlite_client.ts";

async function runSqliteTest() {
  console.log("Running SQLite test...");
  
  try {
    // Initialize SQLite database
    const sqlite = new SqliteClient("./data/test.db");
    console.log("✓ SQLite database initialized");
    
    // Test creating a table
    sqlite.db.execute(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT
      )
    `);
    console.log("✓ Table creation test passed");
    
    // Test inserting data
    sqlite.db.execute(
      "INSERT INTO test_table (name, value) VALUES (?, ?)",
      ["test_name", "test_value"]
    );
    console.log("✓ Data insertion test passed");
    
    // Test querying data
    const rows = sqlite.db.query("SELECT id, name, value FROM test_table");
    console.log("✓ Data query test passed", rows);
    
    // Close database
    sqlite.close();
    console.log("✓ Database closed successfully");
    
    console.log("All SQLite tests passed!");
  } catch (error) {
    console.error("SQLite test failed:", error);
  }
}

// Run test if this file is executed directly
if (import.meta.main) {
  runSqliteTest();
}