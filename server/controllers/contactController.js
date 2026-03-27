import { query } from '../config/postgres.js';
import { sendEmail } from '../utils/mailer.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone, subject, message]
    );

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: `We received your message: ${subject}`,
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you soon.</p>
        <p>Your message:</p>
        <p>${message}</p>
        <p>God bless you,</p>
        <p>nlm cieko Team</p>
      `,
    });

    // Notify admin
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    res.status(201).json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: error.message });
  }
};
