import { transactionPool, wallet, blockchain } from '../server.mjs';
import { pubnubServer } from '../server.mjs';
import Miner from '../models/Miner.mjs';
import Wallet from '../models/Wallet.mjs';
import ResponseModel from '../models/ResponseModel.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';

export const createTransaction = asyncHandler(async (req, res, next) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.findTransactionByAddress({
    address: wallet.publicKey,
  });

  if (transaction) {
    transaction.update({ sender: wallet, recipient, amount });
  } else {
    transaction = wallet.createTransaction({ recipient, amount });
  }

  transactionPool.addTransaction(transaction);
  pubnubServer.broadcastTransaction(transaction);

  const message = `A new transaction of ${amount} CLA to ${recipient} has been successfully created.`;

  const response = new ResponseModel({
    statusCode: 201,
    message: message,
    data: transaction,
  });

  res.status(201).json(response);
});

export const getTransactionPool = asyncHandler(async (req, res, next) => {
  const transactionMap = transactionPool.transactionMap;

  const response = new ResponseModel({
    statusCode: 200,
    data: transactionMap,
  });

  res.status(200).json(response);
});

export const minePendingTransactions = asyncHandler(async (req, res, next) => {
  const miner = new Miner({
    blockchain,
    transactionPool,
    wallet,
    pubsub: pubnubServer,
  });

  miner.mineTransaction();

  const message = `Transactions are currently being mined. Your balance will be updated shortly.`;

  const response = new ResponseModel({
    statusCode: 200,
    message: message,
  });

  res.status(200).json(response);
});

export const getWalletBalance = asyncHandler(async (req, res, next) => {
  const address = wallet.publicKey;
  const balance = Wallet.calculateBalance({
    chain: blockchain,
    address,
  });

  const message = `Your current balance is ${balance} CLA.`;

  const response = new ResponseModel({
    statusCode: 200,
    message: message,
    data: { address: address, balance: balance },
  });

  res.status(200).json(response);
});
