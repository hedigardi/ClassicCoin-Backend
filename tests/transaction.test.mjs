import { it, describe, expect, beforeEach } from 'vitest';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import { verifySignature } from '../utilities/crypto-lib.mjs';
import {
  MINING_REWARD_AMOUNT,
  BLOCK_REWARD_ADDRESS,
} from '../config/settings.mjs';

describe('Transaction Management', () => {
  let transaction, senderWallet, recipientName, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipientName = 'Hedi';
    amount = 25;
    transaction = new Transaction({
      sender: senderWallet,
      recipient: recipientName,
      amount,
    });
  });

  describe('Transaction Properties', () => {
    it('should have a unique ID', () => {
      expect(transaction).toHaveProperty('id');
    });
  });

  describe('Transaction Outputs', () => {
    it('should correctly allocate the amount to the recipient', () => {
      expect(transaction.outputMap[recipientName]).toEqual(amount);
    });

    it('should correctly deduct the amount from the sender', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe('Transaction Inputs', () => {
    it("should record the sender's public key as the address", () => {
      expect(transaction.inputMap.address).toEqual(senderWallet.publicKey);
    });

    it("should record the sender's balance as the amount", () => {
      expect(transaction.inputMap.amount).toEqual(senderWallet.balance);
    });

    it('should sign the transaction input data', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.inputMap.signature,
        })
      ).toBe(true);
    });
  });

  describe('Transaction Validation', () => {
    describe('when the transaction is valid', () => {
      it('should return true', () => {
        expect(Transaction.isValid(transaction)).toBe(true);
      });
    });

    describe('when the transaction is invalid', () => {
      describe('due to an invalid output amount', () => {
        it('should return false', () => {
          transaction.outputMap[senderWallet.publicKey] = 123456789;
          expect(Transaction.isValid(transaction)).toBe(false);
        });
      });

      describe('due to an invalid input signature', () => {
        it('should return false', () => {
          transaction.inputMap.signature = new Wallet().sign(
            'This is just dummy data'
          );
          expect(Transaction.isValid(transaction)).toBe(false);
        });
      });
    });
  });

  describe('Transaction Updates', () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    describe('when the amount is invalid (insufficient funds)', () => {
      it('should throw an error', () => {
        expect(() => {
          transaction.update({
            sender: senderWallet,
            recipient: recipientName,
            amount: 1010,
          });
        }).toThrow('Insufficient funds!');
      });
    });

    describe('when the amount is valid', () => {
      beforeEach(() => {
        originalSignature = transaction.inputMap.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextAmount = 30;
        nextRecipient = 'Adam';

        transaction.update({
          sender: senderWallet,
          recipient: nextRecipient,
          amount: nextAmount,
        });
      });

      it('should allocate the correct amount to the next recipient', () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
      });

      it('should deduct the correct amount from the original sender output balance', () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
          originalSenderOutput - nextAmount
        );
      });

      it('should match the total output amount with the input amount', () => {
        expect(
          Object.values(transaction.outputMap).reduce(
            (total, amount) => total + amount
          )
        ).toEqual(transaction.inputMap.amount);
      });

      it('should create a new signature for the updated transaction', () => {
        expect(transaction.inputMap.signature).not.toEqual(originalSignature);
      });
    });
  });

  describe('Transaction Rewards', () => {
    let transactionReward, minerWallet;

    beforeEach(() => {
      minerWallet = new Wallet();
      transactionReward = Transaction.createRewardTransaction({
        miner: minerWallet,
      });
    });

    it('should create a reward transaction with the address of the miner', () => {
      expect(transactionReward.inputMap).toEqual(BLOCK_REWARD_ADDRESS);
    });

    it('should create only one transaction with the MINING_REWARD_AMOUNT', () => {
      expect(transactionReward.outputMap[minerWallet.publicKey]).toEqual(
        MINING_REWARD_AMOUNT
      );
    });
  });
});
