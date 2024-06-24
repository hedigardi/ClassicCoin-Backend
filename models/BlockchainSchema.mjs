import mongoose from 'mongoose';

const blockchainSchema = new mongoose.Schema({
  timestamp: { type: Number, required: true },
  lastHash: { type: String, required: true },
  hash: { type: String, required: true },
  data: { type: Array, required: true },
  nonce: { type: Number, required: true },
  difficulty: { type: Number, required: true },
});

const chainSchema = new mongoose.Schema({
  chain: [blockchainSchema],
});

const Chain = mongoose.model('Chain', chainSchema);

export default Chain;
