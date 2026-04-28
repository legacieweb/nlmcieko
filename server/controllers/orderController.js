import { query } from '../config/postgres.js';

export const createOrder = async (req, res) => {
  const { fullName, phone, county, town, address, postalCode, quantity, notes } = req.body;
  const userId = req.user.id;
  const email = req.user.email;
  const bookTitle = req.body.bookTitle || 'The Word of God Christian Book';

  try {
    const result = await query(
      'INSERT INTO orders (user_id, book_title, full_name, email, address, city, county, postal_code, phone, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [userId, bookTitle, fullName, email, address, town, county, postalCode, phone, quantity, notes]
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
    
    // Map snake_case to camelCase for frontend
    const orders = result.rows.map(order => ({
      _id: order.id.toString(),
      userId: order.user_id,
      bookTitle: order.book_title,
      fullName: order.full_name,
      email: order.email,
      address: order.address,
      town: order.city,
      county: order.county,
      postalCode: order.postal_code,
      phone: order.phone,
      quantity: order.quantity,
      notes: order.notes,
      status: order.status,
      trackingNumber: order.tracking_number,
      createdAt: order.created_at
    }));
    
    res.json(orders);
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
