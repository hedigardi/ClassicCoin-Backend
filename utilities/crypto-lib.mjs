import crypto from 'crypto';
import pkg from 'elliptic';

const { ec } = pkg;

export const createHash = (...inputs) => {
  return crypto
    .createHash('sha256')
    .update(
      inputs
        .map((input) => JSON.stringify(input))
        .sort()
        .join('')
    )
    .digest('hex');
};

export const elliptic = new ec('secp256k1');

export const verifySignature = ({ publicKey, data, signature }) => {
  const key = elliptic.keyFromPublic(publicKey, 'hex');
  return key.verify(createHash(data), signature);
};
