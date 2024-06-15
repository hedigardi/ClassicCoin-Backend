import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongoDB.mjs';
import Blockchain from './models/Blockchain.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Wallet from './models/Wallet.mjs';
import blockRouter from './routes/block-routes.mjs';
import blockchainRouter from './routes/blockchain-routes.mjs';
import transactionRouter from './routes/transaction-routes.mjs';
import authRouter from './routes/auth-routes.mjs';
import usersRouter from './routes/user-routes.mjs';
import PubNubServer from './pubnub-server.mjs';
import fetch from 'node-fetch';
import { errorHandler } from './middleware/errorHandler.mjs';
import ErrorResponse from './models/ErrorResponseModel.mjs';

dotenv.config({ path: './config/config.env' });

connectDB();

const CRYPTO_CURRENCY = 'Classic Coin (CLA)';

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();

export const pubnubServer = new PubNubServer({
  blockchain: blockchain,
  transactionPool: transactionPool,
  wallet: wallet,
  credentials: {
    publishKey: process.env.PUBLISH_KEY,
    subscribeKey: process.env.SUBSCRIBE_KEY,
    secretKey: process.env.SECRET_KEY,
    userId: process.env.USER_ID,
  },
});

const app = express();
app.use(express.json());

const DEFAULT_PORT = 5001;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;

let NODE_PORT;

setTimeout(() => {
  pubnubServer.broadcast();
}, 1000);

app.use('/api/v1/blockchain', blockchainRouter);
app.use('/api/v1/block', blockRouter);
app.use('/api/v1/wallet', transactionRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
  next(
    new ErrorResponse(`Could not find the resource ${req.originalUrl}`, 404)
  );
});

app.use(errorHandler);

const synchronize = async () => {
  let response = await fetch(`${ROOT_NODE}/api/v1/blockchain`);
  if (response.ok) {
    const result = await response.json();
    blockchain.replaceChain(result.data);
  }

  response = await fetch(`${ROOT_NODE}/api/v1/wallet/transactions`);
  if (response.ok) {
    const result = await response.json();
    transactionPool.replaceTransactionMap(result.data);
  }
};

if (process.env.GENERATE_NODE_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const startServer = () => {
  const PORT = NODE_PORT || DEFAULT_PORT;

  app.listen(PORT, () => {
    console.log(
      `The server for ${CRYPTO_CURRENCY} is running on port: ${PORT}`
    );

    if (PORT !== DEFAULT_PORT) {
      synchronize();
    }
  });
};

startServer();
