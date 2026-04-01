import { query } from '../config/postgres.js';
import ServantCustomization from '../models/ServantCustomization.js';
import ServantVisit from '../models/ServantVisit.js';
import { bookContent } from '../data/bookContent.js';

export const getAllOrders = async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBeliefSubmissions = async (req, res) => {
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
};

export const getAnalytics = async (req, res) => {
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

    res.json({
      totalOrders: totalOrders.rows[0].count,
      ordersByStatus: ordersByStatus.rows,
      averageBelief: averageBelief.rows[0].avg,
      beliefDistribution: beliefDistribution.rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const saveLyrics = async (req, res) => {
  const { songId, content } = req.body;
  try {
    await query(
      'INSERT INTO lyrics (song_id, content) VALUES ($1, $2) ON CONFLICT (song_id) DO UPDATE SET content = $2',
      [songId, content]
    );
    res.json({ message: 'Lyrics saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLyrics = async (req, res) => {
  const { songId } = req.params;
  try {
    const result = await query('SELECT * FROM lyrics WHERE song_id = $1', [songId]);
    res.json(result.rows[0] || { content: '' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const result = await query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, full_name, email, is_admin, is_servant, assigned_page_id, music_genre_subscription FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const promoteToServant = async (req, res) => {
  const { userId, isServant } = req.body;
  try {
    // Get user details first
    const userRes = await query('SELECT full_name FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const userName = userRes.rows[0].full_name;

    await query('UPDATE users SET is_servant = $1 WHERE id = $2', [isServant, userId]);
    
    // Auto-create page if promoted and doesn't have one
    if (isServant) {
      const pageCheck = await query('SELECT assigned_page_id FROM users WHERE id = $1', [userId]);
      if (!pageCheck.rows[0].assigned_page_id) {
        const pageRes = await query(
          'INSERT INTO servant_pages (title, content) VALUES ($1, $2) RETURNING id',
          [`${userName}'s Ministry Page`, `Welcome to the ministry page of ${userName}. More content coming soon!`]
        );
        await query('UPDATE users SET assigned_page_id = $1 WHERE id = $2', [pageRes.rows[0].id, userId]);
      }
    }
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createServantPage = async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await query(
      'INSERT INTO servant_pages (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getServantPages = async (req, res) => {
  try {
    const result = await query('SELECT * FROM servant_pages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignWebpage = async (req, res) => {
  const { userId, pageId } = req.body;
  try {
    await query('UPDATE users SET assigned_page_id = $1 WHERE id = $2', [pageId, userId]);
    res.json({ message: 'Webpage assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignedPage = async (req, res) => {
  try {
    const userResult = await query('SELECT assigned_page_id FROM users WHERE id = $1', [req.user.id]);
    const pageId = userResult.rows[0]?.assigned_page_id;
    
    if (!pageId) {
      return res.status(404).json({ message: 'No page assigned' });
    }

    const pageResult = await query('SELECT * FROM servant_pages WHERE id = $1', [pageId]);
    res.json(pageResult.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const subscribeToGenre = async (req, res) => {
  const { genre } = req.body;
  try {
    await query('UPDATE users SET music_genre_subscription = $1 WHERE id = $2', [genre, req.user.id]);
    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userResult = await query('SELECT music_genre_subscription, last_notified_at FROM users WHERE id = $1', [req.user.id]);
    const { music_genre_subscription, last_notified_at } = userResult.rows[0];

    if (!music_genre_subscription) {
      return res.json({ count: 0 });
    }

    const releasesResult = await query(
      'SELECT COUNT(*) FROM songs WHERE genre = $1 AND created_at > $2',
      [music_genre_subscription, last_notified_at]
    );
    
    res.json({ count: parseInt(releasesResult.rows[0].count) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await query('UPDATE users SET last_notified_at = CURRENT_TIMESTAMP WHERE id = $1', [req.user.id]);
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateServantCustomization = async (req, res) => {
  try {
    const customization = await ServantCustomization.findOneAndUpdate(
      { email: req.user.email },
      { ...req.body, email: req.user.email, userId: req.user.id },
      { new: true, upsert: true }
    );
    res.json(customization);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customization' });
  }
};

export const getServantCustomization = async (req, res) => {
  try {
    const customization = await ServantCustomization.findOne({ email: req.user.email });
    res.json(customization || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customization' });
  }
};

export const getPublicServantPage = async (req, res) => {
  const { id } = req.params; // id could be an ID or a name (slug)
  try {
    let userResult;
    let pageResult;
    
    // Check if id is a number (original behavior)
    if (/^\d+$/.test(id)) {
      userResult = await query(
        'SELECT id, full_name, assigned_page_id FROM users WHERE id = $1 AND is_servant = true',
        [id]
      );
    } else {
      const isEmail = id.includes('@');
      const searchTerm = isEmail ? id : id.replace(/-/g, ' ');

      // 1. Search by servant_pages.title (the page name) - more robust search
      const pageSearch = await query(
        "SELECT * FROM servant_pages WHERE LOWER(title) = LOWER($1) OR LOWER(REPLACE(title, '''', '')) = LOWER($1)",
        [searchTerm]
      );

      if (pageSearch.rows.length > 0) {
        pageResult = pageSearch.rows[0];
        // Now find the user assigned to this page
        userResult = await query(
          'SELECT id, full_name, email, assigned_page_id, music_genre_subscription FROM users WHERE assigned_page_id = $1 AND is_servant = true',
          [pageResult.id]
        );
      } else {
        // 2. Search by user email or full_name (fallback)
        userResult = await query(
          'SELECT id, full_name, email, assigned_page_id, music_genre_subscription FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(full_name) = LOWER($2)) AND is_servant = true',
          [id.toLowerCase(), searchTerm.toLowerCase()]
        );
      }
    }
    
    if (!userResult || userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Servant not found' });
    }

    const user = userResult.rows[0];
    
    // Fetch page if not already fetched
    if (!pageResult) {
       const res = await query('SELECT * FROM servant_pages WHERE id = $1', [user.assigned_page_id]);
       pageResult = res.rows[0];
    }

    // Fetch related music if servant has a subscription
    let relatedSongs = [];
    if (user.music_genre_subscription) {
      const songsRes = await query(
        'SELECT id, title, artist, genre, audio_url, thumbnail_url FROM songs WHERE genre = $1 LIMIT 6',
        [user.music_genre_subscription]
      );
      relatedSongs = songsRes.rows;
    }

    const customization = await ServantCustomization.findOne({ userId: user.id });

    // Get visit count from MongoDB
    const visitCount = await ServantVisit.countDocuments({ servantId: user.id });

    res.json({
      servant: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        musicGenre: user.music_genre_subscription,
        visits: visitCount
      },
      page: pageResult || null,
      customization: customization || {},
      songs: relatedSongs,
      book: bookContent
    });
  } catch (error) {
    console.error('Error fetching public servant page:', error);
    res.status(500).json({ message: 'Error fetching public page' });
  }
};

export const recordServantVisit = async (req, res) => {
  const { servantId } = req.body;
  const visitorIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  try {
    // Try to create a visit record - unique index on (servantId, visitorIp) 
    // in MongoDB will automatically prevent duplicates
    await ServantVisit.findOneAndUpdate(
      { servantId, visitorIp },
      { servantId, visitorIp },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error recording visit' });
  }
};

export const contactServant = async (req, res) => {
  const { servantId, name, email, message } = req.body;
  try {
    await query(
      'INSERT INTO servant_contacts (servant_id, name, email, message) VALUES ($1, $2, $3, $4)',
      [servantId, name, email, message]
    );
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getServantContacts = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM servant_contacts WHERE servant_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

export const getServantVisits = async (req, res) => {
  try {
    const visits = await ServantVisit.find({ servantId: req.user.id }).sort({ createdAt: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visits' });
  }
};

export const resetServantPage = async (req, res) => {
  const { userId } = req.body;
  try {
    // Get user and their assigned page
    const userRes = await query('SELECT full_name, email, assigned_page_id FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = userRes.rows[0];
    const pageId = user.assigned_page_id;

    if (pageId) {
      // Reset PostgreSQL page content
      await query(
        'UPDATE servant_pages SET title = $1, content = $2 WHERE id = $3',
        [`${user.full_name}'s Ministry Page`, `Welcome to the ministry page of ${user.full_name}. More content coming soon!`, pageId]
      );
    }

    // Reset MongoDB customizations
    await ServantCustomization.deleteOne({ email: user.email });
    
    // Optional: Reset visits
    await ServantVisit.deleteMany({ servantId: userId });

    res.json({ message: 'Page reset to default successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Error resetting page' });
  }
};
