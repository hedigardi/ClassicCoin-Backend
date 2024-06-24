import { STARTING_BALANCE } from '../config/settings.mjs';
import { createHash, elliptic } from '../utilities/crypto-lib.mjs';
import Transaction from './Transaction.mjs';

export default class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = elliptic.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  static calculateBalance({ chain, address }) {
    let total = 0;
    let hasAddedTransaction = false;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasAddedTransaction = true;
        }
        const value = transaction.outputMap[address];
        if (value) {
          total += value;
        }
      }
      if (hasAddedTransaction) break;
    }
    return hasAddedTransaction ? total : STARTING_BALANCE + total;
  }

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }

    if (amount > this.balance) throw new Error('Insufficient funds!');

    return new Transaction({ sender: this, recipient, amount });
  }

  sign(data) {
    return this.keyPair.sign(createHash(data));
  }
}
