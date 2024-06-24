import { test, it, expect, beforeEach, describe } from 'vitest';
import Wallet from '../models/Wallet.mjs';
import { verifySignature } from '../utilities/crypto-lib.mjs';
import Transaction from '../models/Transaction.mjs';

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  describe('Properties', () => {
    it('should have a property named balance', () => {
      expect(wallet).toHaveProperty('balance');
    });
    it('should have a property named keyPair', () => {
      expect(wallet).toHaveProperty('keyPair');
    });
    it('should have a property named publicKey', () => {
      expect(wallet).toHaveProperty('publicKey');
    });
  });

  describe('Signing process', () => {
    let data = 'test';

    it('should verify a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });

    it('should not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      );
    });
  });

  describe('Create transaction', () => {
    describe('and the amout is valid', () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 25;
        recipient = 'Nils';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it('should create a Transaction object', () => {
        expect(transaction).toBeInstanceOf(Transaction);
      });

      it('should math the wallet inputMap', () => {
        expect(transaction.inputMap.address).toEqual(wallet.publicKey);
      });

      it('should output the amount to the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });
  });
});
