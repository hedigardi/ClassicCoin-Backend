import express from 'express';
import {
  createTransaction,
  getTransactionPool,
  getWalletBalance,
  minePendingTransactions,
} from '../controllers/transaction-controller.mjs';

const router = express.Router();

router.route('/transaction').post(createTransaction);
router.route('/transactions').get(getTransactionPool);
router.route('/mine').get(minePendingTransactions);
router.route('/info').get(getWalletBalance);

export default router;
