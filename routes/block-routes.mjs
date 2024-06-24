import express from 'express';
import { mineBlock } from '../controllers/block-controller.mjs';

const router = express.Router();

router.post('/mine', mineBlock);

export default router;
