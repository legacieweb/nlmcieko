import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text, params) => pool.query(text, params);

export const initPostgres = async () => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Beliefs table (Question submissions)
    await query(`
      CREATE TABLE IF NOT EXISTS beliefs (
        id SERIAL PRIMARY KEY,
        email TEXT,
        percentage INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        book_title TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Songs table - for admin uploaded music
    await query(`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT DEFAULT 'NLM Cieko',
        genre TEXT NOT NULL,
        audio_url TEXT NOT NULL,
        thumbnail_url TEXT,
        lyrics TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add thumbnail_url column if it doesn't exist
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='thumbnail_url') THEN
          ALTER TABLE songs ADD COLUMN thumbnail_url TEXT;
        END IF;
      END $$;
    `);

    // Contacts table
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed admin if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nlmcieko.com';
    const adminCheck = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await query(
        'INSERT INTO users (full_name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        ['System Admin', adminEmail, hashedPassword, true]
      );
      console.log('Admin user seeded successfully');
    }

    console.log('PostgreSQL (Neon) initialized with all tables');
  } catch (error) {
    console.error('PostgreSQL initialization error:', error);
  }
};

export default pool;
