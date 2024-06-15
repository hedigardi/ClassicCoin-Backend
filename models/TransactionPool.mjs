import Transaction from './Transaction.mjs';

export default class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  addTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  clearBlockTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }

  clearTransactions() {
    this.transactionMap = {};
  }

  findTransactionByAddress({ address }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(
      (transaction) => transaction.inputMap.address === address
    );
  }

  getValidTransactions() {
    return Object.values(this.transactionMap).filter((transaction) =>
      Transaction.isValid(transaction)
    );
  }

  replaceTransactionMap(transactionMap) {
    this.transactionMap = transactionMap;
  }
}
