const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); // Import Op để so sánh
const sendEmail = require('../utils/sendEmail'); // Import dịch vụ email

// --- 1. Đăng Ký ---
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 1. Validate dữ liệu đầu vào
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Vui lòng nhập đủ username, email và password' });
    }

    // 2. Kiểm tra trùng lặp email
    let existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email này đã tồn tại' });
    }

    // 3. Kiểm tra trùng lặp username
    existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      return res.status(400).json({ msg: 'Username này đã tồn tại' });
    }

    // 4. Tạo người dùng
    const newUser = await User.create({
      username,
      email,
      password
      // Hook 'beforeCreate' sẽ tự động hash mật khẩu
    });

    // 5. Phản hồi
    res.status(201).json({ msg: 'Đăng ký thành công. Vui lòng đăng nhập.' });

  } catch (err) {
    console.error('--- LỖI KHI ĐĂNG KÝ ---');
    console.error(err); 
    console.error('-----------------------');
    
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            msg: 'Dữ liệu không hợp lệ', 
            errors: err.errors.map(e => e.message) 
        });
    }
    
    res.status(500).send('Lỗi Server');
  }
};

// --- 2. Đăng Nhập ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không hợp lệ' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không hợp lệ' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// --- 3. Đổi Mật khẩu (Khi đã đăng nhập) ---
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy từ middleware

    // 1. Tìm user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
    }

    // 2. Kiểm tra mật khẩu cũ
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Mật khẩu cũ không đúng' });
    }

    // 3. Đặt mật khẩu mới
    user.password = newPassword;
    await user.save(); // Hook 'beforeUpdate' sẽ tự động hash mật khẩu mới

    res.json({ msg: 'Đổi mật khẩu thành công' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};


// --- 4. Quên Mật khẩu (Gửi OTP) ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ msg: 'Nếu email tồn tại, OTP đã được gửi' });
    }

    // 1. Tạo OTP (6 số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Lưu OTP và thời gian hết hạn (10 phút)
    user.otpCode = otp;
    user.otpExpires = Date.now() + 600000; // 10 phút (ms)
    await user.save({ fields: ['otpCode', 'otpExpires'] });

    // 3. Gửi email cho user
    try {
      await sendEmail(
        user.email, 
        'Mã OTP lấy lại mật khẩu', 
        `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`
      );
    } catch (emailError) {
      console.error('Lỗi gửi email nghiêm trọng:', emailError);
      return res.status(500).json({ msg: 'Lỗi khi gửi email' });
    }
    
    res.status(200).json({ 
      msg: 'OTP đã được gửi tới email của bạn.'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};


// --- 5. Reset Mật khẩu (Dùng OTP) ---
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1. Tìm user bằng email, OTP VÀ OTP chưa hết hạn
    const user = await User.findOne({
      where: {
        email: email,
        otpCode: otp,
        otpExpires: { [Op.gt]: Date.now() } // Phải lớn hơn thời gian hiện tại
      }
    });

    if (!user) {
      return res.status(400).json({ msg: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    // 2. Đặt mật khẩu mới và xóa OTP
    user.password = newPassword;
    user.otpCode = null; // Xóa OTP để không dùng lại
    user.otpExpires = null; // Xóa thời gian
    
    await user.save(); // Hook 'beforeUpdate' sẽ hash mật khẩu mới

    res.json({ msg: 'Mật khẩu đã được reset thành công' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};