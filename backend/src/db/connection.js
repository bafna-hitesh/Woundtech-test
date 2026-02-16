import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory path (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path - creates 'database.db' in backend folder
const dbPath = join(__dirname, '../../database.db');

// Create database connection
// verbose: logs every SQL query to console (helpful for debugging)
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints (SQLite has them disabled by default!)
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // exec() runs multiple SQL statements at once
  db.exec(schema);
  
  console.log('Database initialized successfully');
}

// Run initialization
initializeDatabase();

// Export the database connection for use in services
export default db;
