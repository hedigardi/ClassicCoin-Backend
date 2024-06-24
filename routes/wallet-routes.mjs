import express from 'express';
import {
  addTransaction,
  getTransactionPool,
  getWalletbalance,
  getWalletEndpoints,
  mineTransaction,
  signIn,
  signUp,
} from '../controllers/wallet-controller.mjs';
import { authenticate, authorize } from '../middleware/authorization.mjs';

const router = express.Router();

router.post('/transaction', authenticate, authorize('user'), addTransaction);
router.get('/transactions', getTransactionPool);
router.get('/balance', getWalletbalance);
router.get('/', getWalletEndpoints);
router.get('/mine-transactions', mineTransaction);
router.post('/signin', signIn);
router.post('/signup', signUp);
export default router;
