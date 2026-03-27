import { query } from '../config/postgres.js';

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
