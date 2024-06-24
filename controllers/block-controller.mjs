import { blockchain, pubnubServer } from '../server.mjs';
import ResponseModel from '../models/ResponseModel.mjs';

export const mineBlock = (req, res, next) => {
  const data = req.body;

  const block = blockchain.addBlock({ data });

  pubnubServer.broadcast();
  res.status(201).json(ResponseModel.post('', block));
};
