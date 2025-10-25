const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Đăng ký người dùng
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Đăng nhập người dùng
router.post('/login', login);

module.exports = router;