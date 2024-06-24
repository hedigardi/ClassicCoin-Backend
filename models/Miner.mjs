import Transaction from './Transaction.mjs';

export default class Miner {
  constructor({ blockchain, wallet, transactionPool, pubnubServer }) {
    this.blockchain = blockchain;
    this.wallet = wallet;
    this.transactionPool = transactionPool;
    this.pubnubServer = pubnubServer;
  }

  mineTransaction() {
    const validTransactions = this.transactionPool.validateTransactions();
    validTransactions.push(
      Transaction.transactionReward({ minerWallet: this.wallet })
    );
    this.blockchain.addBlock({ data: validTransactions });
    this.pubnubServer.broadcast();
    this.transactionPool.clearTransactions();
  }
}
