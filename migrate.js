import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgres://postgres:chinni@localhost:5432/url_shortener',
});

async function migrate() {
  try {
    console.log('Starting migration...');
    
    await pool.query(`
      ALTER TABLE urls 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_password_protected BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    
    console.log('✓ Migration completed successfully!');
    console.log('✓ Added password_hash column');
    console.log('✓ Added is_password_protected column');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
