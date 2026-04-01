import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/postgres.js';
import { protect, isAdmin, isServant } from '../middleware/auth.js';
import multer from 'multer';

import { 
  getUsers, 
  promoteToServant, 
  createServantPage, 
  getServantPages, 
  assignWebpage,
  subscribeToGenre,
  getNotifications,
  clearNotifications,
  getAssignedPage,
  updateServantCustomization,
  getServantCustomization,
  getPublicServantPage,
  recordServantVisit,
  contactServant,
  getServantContacts,
  getServantVisits
} from '../controllers/adminController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for music file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/assets/music');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// ===== PUBLIC ROUTES =====

router.get('/servant-view/:id', getPublicServantPage);
router.post('/servant-view/visit', recordServantVisit);
router.post('/servant-view/contact', contactServant);

// Get all songs from database (optimized: exclude lyrics for faster loading)
router.get('/songs', async (req, res) => {
  try {
    const result = await query('SELECT id, title, artist, genre, audio_url, thumbnail_url, created_at FROM songs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Error fetching songs' });
  }
});

// Get a single song from database
router.get('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM songs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Error fetching song' });
  }
});

// Get lyrics for a specific song
router.get('/lyrics/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    const result = await query('SELECT lyrics FROM songs WHERE id = $1', [songId]);
    
    if (result.rows.length > 0) {
      res.json({ content: result.rows[0].lyrics || '' });
    } else {
      res.json({ content: '' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lyrics' });
  }
});

// ===== ADMIN PROTECTED ROUTES =====

router.use(protect);

// Song management (Admin Only)
router.post('/songs', isAdmin, upload.single('audioFile'), async (req, res) => {
  const { title, artist, genre, lyrics, thumbnailUrl } = req.body;
  
  // Get the file URL or use provided URL
  let audioUrl = req.body.audioUrl || '';
  if (req.file) {
    audioUrl = `/assets/music/${req.file.filename}`;
  }
  
  if (!title || !genre || !audioUrl) {
    return res.status(400).json({ message: 'Title, genre, and audio file/URL are required' });
  }
  
  try {
    const result = await query(
      'INSERT INTO songs (title, artist, genre, audio_url, thumbnail_url, lyrics) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, artist || 'NLM Cieko', genre, audioUrl, thumbnailUrl || '', lyrics || '']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ message: 'Error adding song' });
  }
});

router.put('/songs/:id', isAdmin, upload.single('audioFile'), async (req, res) => {
  const { id } = req.params;
  const { title, artist, genre, lyrics, thumbnailUrl } = req.body;
  
  // Get the file URL or use provided URL
  let audioUrl = req.body.audioUrl;
  if (req.file) {
    audioUrl = `/assets/music/${req.file.filename}`;
  }
  
  try {
    const result = await query(
      'UPDATE songs SET title = $1, artist = $2, genre = $3, audio_url = $4, thumbnail_url = $5, lyrics = $6 WHERE id = $7 RETURNING *',
      [title, artist, genre, audioUrl, thumbnailUrl, lyrics, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating song' });
  }
});

router.delete('/songs/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await query('DELETE FROM songs WHERE id = $1', [id]);
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting song' });
  }
});

// Analytics (Admin Only)
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    const totalOrders = await query('SELECT COUNT(*) FROM orders');
    const ordersByStatus = await query('SELECT status, COUNT(*) FROM orders GROUP BY status');
    const averageBelief = await query('SELECT AVG(percentage) FROM beliefs');
    const beliefDistribution = await query(`
      SELECT 
        CASE 
          WHEN percentage = 100 THEN '100%'
          WHEN percentage >= 75 THEN '75-99%'
          WHEN percentage >= 50 THEN '50-74%'
          ELSE 'Below 50%'
        END as range,
        COUNT(*) 
      FROM beliefs 
      GROUP BY range
    `);
    const totalSongs = await query('SELECT COUNT(*) FROM songs');

    res.json({
      totalOrders: totalOrders.rows[0].count,
      ordersByStatus: ordersByStatus.rows,
      averageBelief: averageBelief.rows[0].avg,
      beliefDistribution: beliefDistribution.rows,
      totalSongs: totalSongs.rows[0].count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders (Admin Only)
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Beliefs (Admin Only)
router.get('/beliefs', isAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*, u.full_name 
      FROM beliefs b 
      LEFT JOIN users u ON b.email = u.email 
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Contacts (Admin Only)
router.get('/contacts', isAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management (Admin Only)
router.get('/users', isAdmin, getUsers);
router.post('/users/promote', isAdmin, promoteToServant);
router.post('/users/assign-page', isAdmin, assignWebpage);

// Servant Pages Management (Admin Only)
router.get('/servant-pages', isAdmin, getServantPages);
router.post('/servant-pages', isAdmin, createServantPage);

// Servant Workspace routes (Servant or Admin)
router.get('/servant/page', isServant, getAssignedPage);
router.post('/servant/subscribe', isServant, subscribeToGenre);
router.get('/servant/notifications', isServant, getNotifications);
router.post('/servant/clear-notifications', isServant, clearNotifications);

// Servant customization (MongoDB) (Servant or Admin)
router.get('/servant/customization', isServant, getServantCustomization);
router.post('/servant/customization', isServant, updateServantCustomization);
router.get('/servant/contacts', isServant, getServantContacts);
router.get('/servant/visits', isServant, getServantVisits);

export default router;
