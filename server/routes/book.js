import express from 'express';
import { getBook, downloadBook } from '../controllers/bookController.js';

const router = express.Router();

router.get('/', getBook);
router.post('/download', downloadBook);

export default router;
