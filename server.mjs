import express from 'express';
import dotenv from 'dotenv';
import PubNubServer from './pubnub-server.mjs';
import Blockchain from './models/Blockchain.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Wallet from './models/Wallet.mjs';
import blockRouter from './routes/block-routes.mjs';
import blockchainRouter from './routes/blockchain-routes.mjs';
import walletRouter from './routes/wallet-routes.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import ErrorResponse from './models/ErrorResponseModel.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/mongoDB.mjs';
import { configureSecurityMiddleware } from './middleware/securityMiddleware.mjs';

dotenv.config({ path: './config/config.env' });

connectDB();

const BLOCKCHAIN = 'Classic Coin (CLA)';

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();

export const pubnubServer = new PubNubServer({
  blockchain,
  transactionPool,
  wallet,
  credentials: {
    publishKey: process.env.PUBLISH_KEY,
    subscribeKey: process.env.SUBSCRIBE_KEY,
    secretKey: process.env.SECRET_KEY,
    userId: process.env.USER_ID,
  },
});

const fileName = fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);
global.__appdir = dirname;

const app = express();
app.use(express.json());

configureSecurityMiddleware(app);

const DEFAULT_PORT = 5001;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;

let NODE_PORT;

setTimeout(() => {
  pubnubServer.broadcast();
}, 1000);

app.use('/api/v1/block', blockRouter);
app.use('/api/v1/blockchain', blockchainRouter);
app.use('/api/v1/wallet', walletRouter);

app.all('*', (req, res, next) => {
  next(
    new ErrorResponse(`Could not find the resource ${req.originalUrl}`, 404)
  );
});

app.use(errorHandler);

const synchronize = async (ROOT_NODE) => {
  let response = await fetch(`${ROOT_NODE}/api/v1/blockchain`);
  if (response.ok) {
    const result = await response.json();
    blockchain.replaceChain(result.data.chain);
  }

  response = await fetch(`${ROOT_NODE}/api/v1/wallet/transactions`);
  if (response.ok) {
    const result = await response.json();
    transactionPool.replaceTransactionMap(result.data);
  }
};

if (process.env.GENERATE_PEER_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = NODE_PORT || DEFAULT_PORT;
const startServer = app.listen(PORT, async () => {
  console.log(`The server for ${BLOCKCHAIN} is running on port: ${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    await synchronize(ROOT_NODE);
  }
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection at: ${promise} - Reason: ${err.message}`);
  startServer.close(() => process.exit(1));
});
