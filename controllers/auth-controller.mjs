import User from '../models/UserModel.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';

// @desc    Get information about the logged-in user
// @route   GET /api/v1/auth/me
// @access  PRIVATE
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('block');
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: user,
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  PUBLIC
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;

  if (!email) {
    return next(new ErrorResponse('Email does not exist for recovery', 400));
  }

  let foundUser = await User.findOne({ email });

  if (!foundUser)
    return next(new ErrorResponse(`No user found with email ${email}`, 400));

  const resetToken = foundUser.createResetPasswordToken();
  await foundUser.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  res.status(200).json({
    success: true,
    statusCode: 201,
    data: { token: resetToken, url: resetUrl },
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  PUBLIC
export const resetPassword = asyncHandler(async (req, res, next) => {
  const newPassword = req.body.password;
  const token = req.params.token;

  if (!newPassword) return next(new ErrorResponse('Password is missing', 400));

  let foundUser = await User.findOne({ resetPasswordToken: token });

  foundUser.password = newPassword;
  foundUser.resetPasswordToken = undefined;
  foundUser.resetPasswordTokenExpire = undefined;

  await foundUser.save();

  createAndSendToken(foundUser, 200, res);
});

const createAndSendToken = (user, statusCode, res) => {
  const token = user.generateToken();

  res.status(statusCode).json({ success: true, statusCode, token });
};

// @desc    Log in a user
// @route   POST /api/v1/auth/signin
// @access  PUBLIC
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Email and/or password missing', 400));
  }

  const foundUser = await User.findOne({ email }).select('+password');

  if (!foundUser) {
    return next(new ErrorResponse('Invalid login credentials', 401));
  }

  const isPasswordValid = await foundUser.validatePassword(password);

  if (!isPasswordValid) {
    return next(new ErrorResponse('Invalid login credentials', 401));
  }

  createAndSendToken(foundUser, 200, res);
});

// @desc    Register a user
// @route   POST /api/v1/auth/signup
// @access  PUBLIC
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const newUser = await User.create({ name, email, password, role });

  createAndSendToken(newUser, 201, res);
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  PRIVATE
export const updatePassword = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id).select('+password');

  if (!(await currentUser.validatePassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Incorrect password', 401));
  }

  currentUser.password = req.body.newPassword;
  await currentUser.save();

  createAndSendToken(currentUser, 200, res);
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updateprofile
// @access  PRIVATE
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, statusCode: 200, data: updatedUser });
});
