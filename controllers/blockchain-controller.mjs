import { blockchain } from '../server.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ResponseModel from '../models/ResponseModel.mjs';

export const listBlock = asyncHandler(async (req, res, next) => {
  const chain = blockchain.chain;

  const message = `Here are all the blocks in the Classic Coin (CLA) blockchain.`;

  const response = new ResponseModel({
    statusCode: 200,
    data: chain,
    message: message,
  });

  res.status(200).json(response);
});
