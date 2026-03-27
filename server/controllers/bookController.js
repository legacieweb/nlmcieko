import { bookContent } from '../data/bookContent.js';
import { sendEmail } from '../utils/mailer.js';

export const getBook = async (req, res) => {
  try {
    // Return the book data from local file instead of DB
    res.json(bookContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadBook = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // We can still send the email with the book content
    await sendEmail({
      to: email,
      subject: `Download: ${bookContent.title}`,
      html: `
        <h2>Thank you for downloading our free Christian book!</h2>
        <p>We're excited that you want to explore the questions and lessons about Jesus Christ and John the Baptist.</p>
        <p><strong>Book Title:</strong> ${bookContent.title}</p>
        <p><strong>Description:</strong> ${bookContent.description}</p>
        <p>This book is designed to take you directly to the Word of God for confirmation and reaffirmation of your faith.</p>
        <hr>
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px;">
          ${bookContent.content}
        </div>
        <hr>
        <p>God bless you,</p>
        <p>nlm cieko Team</p>
      `,
    });

    res.json({ 
      message: 'Book sent to your email successfully',
      book: bookContent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
