import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initPostgres, query } from './config/postgres.js';
import contactRoutes from './routes/contact.js';
import bookRoutes from './routes/book.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initPostgres();

// CORS configuration
const allowedOrigins = [
  'https://nlmcieko.iyonicorp.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

app.use('/api/contact', contactRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/belief', async (req, res) => {
  const { percentage, email } = req.body;
  try {
    await query('INSERT INTO beliefs (email, percentage) VALUES ($1, $2)', [email || 'anonymous', percentage]);
    res.status(201).json({ message: 'Belief saved successfully' });
  } catch (error) {
    console.error('Error saving belief:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
