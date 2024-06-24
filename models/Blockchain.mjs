import {
  MINING_REWARD_AMOUNT,
  BLOCK_REWARD_ADDRESS,
} from '../config/settings.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';
import Chain from './BlockchainSchema.mjs';
import Block from './Block.mjs';
import Transaction from './Transaction.mjs';
import ErrorResponse from './ErrorResponseModel.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({ lastBlock: this.chain.at(-1), data });
    this.chain.push(newBlock);
    this.updateChainInDatabase(this.chain);
    return newBlock;
  }

  replaceChain(chain, shouldValidate, callBack) {
    if (chain.length <= this.chain.length) {
      console.error('The new chain must be longer than the current chain!');
      return;
    }
    if (!Blockchain.validateChain(chain)) return;
    if (shouldValidate && !this.validateTransactionData({ chain })) return;

    if (callBack) callBack();
    this.chain = chain;
  }

  validateTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let counter = 0;

      for (let transaction of block.data) {
        if (transaction.inputMap.address === BLOCK_REWARD_ADDRESS.address) {
          counter++;
          if (counter > 1) return false;

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD_AMOUNT)
            return false;
        } else {
          if (!Transaction.validate(transaction)) {
            console.error(
              'Transaction validation failed: Invalid transaction data'
            );
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error(
              'Duplicate transaction detected: Same transaction appears multiple times in block'
            );
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }
    return true;
  }

  static validateChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } =
        chain.at(i);
      const currentLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== currentLastHash) {
        console.error(
          'Invalid chain: lastHash does not match the hash of the previous block'
        );
        return false;
      }

      if (Math.abs(lastDifficulty - difficulty) > 1) {
        console.log(
          'Invalid difficulty adjustment: Difficulty can only change by 1 level at a time'
        );
        return false;
      }

      const validHash = createHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );
      if (hash !== validHash) return false;
    }
    return true;
  }

  async updateChainInDatabase(newChain) {
    try {
      await Chain.deleteMany({});
      const chainDoc = new Chain({ chain: newChain });
      const result = await chainDoc.save();

      console.log(
        'Blockchain successfully updated in the database',
        result._id
      );
    } catch (error) {
      throw new ErrorResponse(
        'Failed to update the blockchain in the database',
        500,
        error
      );
    }
  }
}
