import express from 'express';
import { getBlockchain } from '../controllers/blockchain-controller.mjs';

const router = express.Router();

router.get('/', getBlockchain);

export default router;
