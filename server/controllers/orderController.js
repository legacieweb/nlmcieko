import { query } from '../config/postgres.js';

export const createOrder = async (req, res) => {
  const { bookTitle, fullName, email, address, city, phone } = req.body;
  const userId = req.user.id;

  try {
    const result = await query(
      'INSERT INTO orders (user_id, book_title, full_name, email, address, city, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, bookTitle, fullName, email, address, city, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('CreateOrder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetUserOrders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCounties = async (req, res) => {
  const counties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];
  res.json({ counties });
};
