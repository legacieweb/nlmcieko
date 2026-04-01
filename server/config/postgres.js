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
        is_servant BOOLEAN DEFAULT FALSE,
        assigned_page_id INTEGER,
        music_genre_subscription TEXT,
        last_notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Servant pages table
    await query(`
      CREATE TABLE IF NOT EXISTS servant_pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add servant columns if they don't exist
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_servant') THEN
          ALTER TABLE users ADD COLUMN is_servant BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='assigned_page_id') THEN
          ALTER TABLE users ADD COLUMN assigned_page_id INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='music_genre_subscription') THEN
          ALTER TABLE users ADD COLUMN music_genre_subscription TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_notified_at') THEN
          ALTER TABLE users ADD COLUMN last_notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
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

    // Servant specific contacts
    await query(`
      CREATE TABLE IF NOT EXISTS servant_contacts (
        id SERIAL PRIMARY KEY,
        servant_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Servant page analytics (visits)
    await query(`
      CREATE TABLE IF NOT EXISTS servant_page_visits (
        id SERIAL PRIMARY KEY,
        servant_id INTEGER REFERENCES users(id),
        visitor_ip TEXT,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed admin if not exists, or update to match .env
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nlmcieko.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'NLMCIEKO';
    
    // Seed Bilha page if not exists
    const bilhaCheck = await query('SELECT * FROM servant_pages WHERE title = $1', ['Bilha']);
    if (bilhaCheck.rows.length === 0) {
      await query(
        'INSERT INTO servant_pages (title, content) VALUES ($1, $2)',
        ['Bilha', 'Welcome to the Bilha ministry page. This page is dedicated to spiritual growth and the word of God.']
      );
      console.log('Bilha servant page created');
    }
    
    // Ensure only this specific email is admin
    await query('UPDATE users SET is_admin = false WHERE email != $1', [adminEmail]);
    
    const adminCheck = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (adminCheck.rows.length === 0) {
      await query(
        'INSERT INTO users (full_name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        ['System Admin', adminEmail, hashedPassword, true]
      );
      console.log('Admin user seeded successfully');
    } else {
      // Update existing admin password to match .env
      await query(
        'UPDATE users SET password = $1, is_admin = true WHERE email = $2',
        [hashedPassword, adminEmail]
      );
      console.log('Admin user updated to match .env credentials');
    }

    console.log('PostgreSQL (Neon) initialized with all tables');
  } catch (error) {
    console.error('PostgreSQL initialization error:', error);
  }
};

export default pool;
