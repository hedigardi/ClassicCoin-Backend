import ResponseModel from '../models/ResponseModel.mjs';
import Wallet from '../models/Wallet.mjs';
import { blockchain, pubnubServer, transactionPool } from '../server.mjs';
import { wallet } from '../server.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import User from '../models/UserModel.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import Miner from '../models/Miner.mjs';

export const getWalletEndpoints = (req, res, next) => {
  res.status(200).json(ResponseModel.get('', '/api/v1/wallet'));
  const newWallet = new Wallet();
  const publicKey = newWallet.publicKey;
};

export const addTransaction = (req, res, next) => {
  const { recipient, amount } = req.body;

  let transaction = transactionPool.transactionExists({
    address: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return next(
      new ErrorResponse(`Failed to process transaction: ${error.message}`, 400)
    );
  }

  transactionPool.addTransaction(transaction);
  pubnubServer.broadcastTransaction(transaction);
  res.status(201).json(ResponseModel.post('', transaction));
};

export const getTransactionPool = (req, res, next) => {
  res.status(200).json(ResponseModel.get('', transactionPool.transactionMap));
};

export const getWalletbalance = (req, res, next) => {
  const address = wallet.publicKey;
  const balance = wallet.calculateBalance({ chain: blockchain, address });

  res.status(200).json(ResponseModel.get('', balance));
};

export const mineTransaction = (req, res, next) => {
  const miner = new Miner({
    blockchain,
    wallet,
    transactionPool,
    pubnubServer: pubnubServer,
  });

  miner.mineTransaction();

  res
    .status(200)
    .json(
      ResponseModel.get(
        'Mining in progress...',
        'Please wait while transactions are being mined'
      )
    );
};

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Email and password are required', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Incorrect email or password', 401));
  }

  const isCorrect = await user.validatePassword(password);

  if (!isCorrect) {
    return next(new ErrorResponse('Incorrect email or password', 401));
  }

  createAndSendToken(user, 200, res);
});

export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const newWallet = new Wallet().publicKey;
  const wallet = JSON.stringify(newWallet);

  const userWallet = await User.create({ name, email, password, wallet, role });

  createAndSendToken(userWallet, 200, res);
});

const createAndSendToken = (user, statusCode, res) => {
  const token = user.generateToken();

  res.status(statusCode).json({ success: true, statusCode, token });
};
