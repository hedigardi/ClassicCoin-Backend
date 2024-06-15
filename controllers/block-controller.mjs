import { pubnubServer } from '../server.mjs';
import { blockchain } from '../server.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ResponseModel from '../models/ResponseModel.mjs';
import {
  STARTING_BALANCE,
  BLOCK_REWARD_ADDRESS,
  MINING_REWARD_AMOUNT,
} from '../config/settings.mjs';

export const mineBlock = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const block = blockchain.addBlock({ data: data });

  const message = `Congratulations! A new block has been successfully created. You now have ${STARTING_BALANCE} CLA in your wallet and ${MINING_REWARD_AMOUNT} CLA has been sent to ${BLOCK_REWARD_ADDRESS.address}.`;

  pubnubServer.broadcast();

  const response = new ResponseModel({
    statusCode: 201,
    data: block,
    message: message,
  });

  res.status(201).json(response);
});
