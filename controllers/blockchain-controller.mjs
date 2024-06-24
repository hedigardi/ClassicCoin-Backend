import ResponseModel from '../models/ResponseModel.mjs';
import { blockchain } from '../server.mjs';

export const getBlockchain = (req, res, next) => {
  res.status(200).json(ResponseModel.get('', blockchain));
};
