import { it, describe, expect, beforeEach } from 'vitest';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import TransactionPool from '../models/TransactionPool.mjs';
import Blockchain from '../models/Blockchain.mjs';

describe('Transaction Pool Functionality', () => {
  let transactionPool, transaction, sender;
  sender = new Wallet();

  beforeEach(() => {
    transaction = new Transaction({
      sender,
      recipient: 'Nils Nilsson',
      amount: 70,
    });
    transactionPool = new TransactionPool();
  });

  describe('Properties', () => {
    it('should have a property named transactionMap', () => {
      expect(transactionPool).toHaveProperty('transactionMap');
    });
  });

  describe('Adding Transactions', () => {
    it('should add a transaction to the transaction pool', () => {
      transactionPool.addTransaction(transaction);

      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe('Finding Transactions by Address', () => {
    it('should retrieve a transaction based on its sender address', () => {
      transactionPool.addTransaction(transaction);

      expect(
        transactionPool.findTransactionByAddress({ address: sender.publicKey })
      ).toBe(transaction);
    });
  });

  describe('Validating Transactions', () => {
    let transactions;

    beforeEach(() => {
      transactions = [];

      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          sender,
          recipient: 'Nils Nilsson',
          amount: 70,
        });

        if (i % 3 === 0) {
          transaction.inputMap.amount = 1010;
        } else if (i % 3 === 1) {
          transaction.inputMap.signature = new Wallet().sign('invalid data');
        } else {
          transactions.push(transaction);
        }

        transactionPool.addTransaction(transaction);
      }
    });

    it('should return only valid transactions', () => {
      expect(transactionPool.getValidTransactions()).toStrictEqual(
        transactions
      );
    });
  });

  describe('Clearing Transactions', () => {
    it('should clear all transactions from the pool', () => {
      transactionPool.clearTransactions();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe('Clearing Block Transactions', () => {
    it('should remove block transactions from the pool', () => {
      const blockchain = new Blockchain();
      const expectedMap = {};

      for (let i = 0; i < 20; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'Nils Nilsson',
          amount: 5,
        });

        transactionPool.addTransaction(transaction);

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedMap[transaction.id] = transaction;
        }
      }

      transactionPool.clearBlockTransactions({ chain: blockchain.chain });

      expect(transactionPool.transactionMap).toEqual(expectedMap);
    });
  });
});
