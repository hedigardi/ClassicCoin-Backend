import Transaction from './Transaction.mjs';

export default class Miner {
  constructor({ blockchain, wallet, transactionPool, pubsub }) {
    this.blockchain = blockchain;
    this.wallet = wallet;
    this.transactionPool = transactionPool;
    this.pubsub = pubsub;
  }

  mineTransaction() {
    const validTransactions = this.transactionPool.getValidTransactions();

    validTransactions.push(
      Transaction.createRewardTransaction({ miner: this.wallet })
    );

    this.blockchain.addBlock({ data: validTransactions });
    this.pubsub.broadcast();
    this.transactionPool.clearTransactions();
  }
}
