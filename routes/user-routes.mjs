import express from 'express';
import { authenticate, authorize } from '../middleware/authorization.mjs';
import {
  addUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/user-controller.mjs';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(addUser);
router.route('/:id').get(getUser).delete(deleteUser).put(updateUser);

export default router;
