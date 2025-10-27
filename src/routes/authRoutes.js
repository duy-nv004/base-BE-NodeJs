const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  changePassword,
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route đổi mật khẩu (Cần đăng nhập)
router.post('/change-password', authMiddleware, changePassword);

// Route yêu cầu OTP (Quên mật khẩu)
router.post('/forgot-password', forgotPassword);

// Route reset mật khẩu (Dùng OTP)
router.post('/reset-password', resetPassword);

module.exports = router;