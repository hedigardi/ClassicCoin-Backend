import express from 'express';
import { authenticate } from '../middleware/authorization.mjs';
import {
  getMe,
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
  updatePassword,
  updateUserProfile,
} from '../controllers/auth-controller.mjs';

const router = express.Router();

router.get('/me', authenticate, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.post('/signin', signIn);
router.post('/signup', signUp);
router.put('/updatepassword', authenticate, updatePassword);
router.put('/updateprofile', authenticate, updateUserProfile);

export default router;
