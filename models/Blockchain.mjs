import {
  MINING_REWARD_AMOUNT,
  BLOCK_REWARD_ADDRESS,
} from '../config/settings.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';
import Block from './Block.mjs';
import Transaction from './Transaction.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain.at(-1),
      data: data,
    });
    this.chain.push(newBlock);
    return newBlock;
  }

  replaceChain(chain, shouldValidate, callback) {
    if (chain.length <= this.chain.length) return;
    if (!Blockchain.validateChain(chain)) return;

    if (shouldValidate && !this.validateTransactionData({ chain })) return;

    if (callback) callback();

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
          if (!Transaction.isValid(transaction)) {
            return false;
          }

          if (transactionSet.has(transaction)) {
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
    if (JSON.stringify(chain.at(0)) !== JSON.stringify(Block.genesis))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } =
        chain.at(i);
      const currentLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== currentLastHash) return false;

      if (Math.abs(lastDifficulty - difficulty) > 1) return false;

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
}
