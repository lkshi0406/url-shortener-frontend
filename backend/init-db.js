import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
  // First, connect to default postgres database to create our database
  const adminPool = new Pool({
    connectionString: 'postgres://postgres:chinni@localhost:5432/postgres',
  });

  try {
    console.log('Creating database...');
    try {
      await adminPool.query('CREATE DATABASE url_shortener');
      console.log('✓ Database created');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('✓ Database already exists');
      } else {
        throw error;
      }
    }
    await adminPool.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
    await adminPool.end();
    process.exit(1);
  }

  // Now connect to our database and create tables
  const appPool = new Pool({
    connectionString: 'postgres://postgres:chinni@localhost:5432/url_shortener',
  });

  try {
    console.log('Setting up schema...');
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute each statement separately to handle CREATE TABLE IF NOT EXISTS
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await appPool.query(statement);
    }

    console.log('✓ Schema created successfully');
    console.log('✓ Database initialized successfully!');
    await appPool.end();
  } catch (error) {
    console.error('Error setting up database:', error.message);
    await appPool.end();
    process.exit(1);
  }
}

initializeDatabase();
