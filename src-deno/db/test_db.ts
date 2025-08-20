// src-deno/db/test_db.ts
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

async function testDatabase() {
  try {
    // Create a simple test database in memory
    const db = new DB(":memory:");
    
    // Create a test table
    db.execute(`
      CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    
    // Insert some test data
    db.execute("INSERT INTO test (name) VALUES (?)", ["Test Entry"]);
    
    // Query the data
    const rows = db.query("SELECT * FROM test");
    for (const row of rows) {
      console.log(row);
    }
    
    console.log("Database test successful!");
    
    // Close the database connection
    db.close();
  } catch (error) {
    console.error("Database test failed:", error);
  }
}

testDatabase();