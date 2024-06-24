import { it, expect, describe, beforeEach } from 'vitest';
import Block from '../models/Block.mjs';

describe('Block', () => {
  const timestamp = Date.now();
  const lastHash = '0';
  const hash = '0';
  const nonce = 1;
  const difficulty = 1;
  const data = { amount: 10, sender: 'Hedi', recipient: 'Adam' };

  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty,
  });

  describe('Properties', () => {
    it('should have the properties timestamp, lastHash, hash, nonce, difficulty, data', () => {
      expect(block).toHaveProperty('timestamp');
      expect(block).toHaveProperty('lastHash');
      expect(block).toHaveProperty('hash');
      expect(block).toHaveProperty('nonce');
      expect(block).toHaveProperty('difficulty');
    });

    it('should have values of each propertys', () => {
      expect(block.timestamp).toBe(timestamp);
      expect(block.lastHash).toBe(lastHash);
      expect(block.hash).toBe(hash);
      expect(block.data).toBe(data);
      expect(block.nonce).toBe(nonce);
      expect(block.difficulty).toBe(difficulty);
    });
  });
});
