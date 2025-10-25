const User = require('../models/user');
const jwt = require('jsonwebtoken');

// --- Đăng Ký ---
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Kiểm tra email đã tồn tại chưa
    let user = await User.findOne({ where: { email: email } });
    if (user) {
      return res.status(400).json({ msg: 'Email đã tồn tại' });
    }

    // 2. Tạo user mới (Mật khẩu được hash tự động bởi Hook)
    user = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({ msg: 'Đăng ký thành công. Vui lòng đăng nhập.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// --- Đăng Nhập ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user bằng email
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không hợp lệ' });
    }

    // 2. So sánh mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không hợp lệ' });
    }

    // 3. Tạo và trả về JWT Token
    const payload = {
      user: {
        id: user.id // Chỉ lưu ID của user vào token
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token hết hạn sau 1 giờ
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Trả token về cho client
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};