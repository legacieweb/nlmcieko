import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { bookContent } from '../data/bookContent.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedBook() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/church-website');

    await Book.deleteMany({});

    const book = new Book(bookContent);
    await book.save();

    console.log('Book data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding book:', error);
    process.exit(1);
  }
}

seedBook();
