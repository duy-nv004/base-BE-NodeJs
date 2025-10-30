const express = require('express');
const dotenv = require('dotenv');
// const nodemailer = require('nodemailer'); // <-- ĐÃ XÓA (Không cần ở file này nữa)

dotenv.config();

// (Lưu ý: Tôi giữ nguyên đường dẫn 'src/' của bạn)
const { sequelize, connectDB } = require('./src/config/db'); 
connectDB();

const User = require('./src/models/User');

const app = express();
app.use(express.json());

// --- Đồng bộ CSDL ---
sequelize.sync() 
  .then(() => {
    console.log('Đã đồng bộ hóa CSDL & models!');
  })
  .catch(err => console.error('Lỗi đồng bộ CSDL:', err));


// --- Định nghĩa Routes ---
app.use('/api/auth', require('./src/routes/authRoutes'));

// Route test (để kiểm tra token)
const authMiddleware = require('./src/middleware/authMiddleware');
app.get('/api/test', authMiddleware, (req, res) => {
  res.json({ 
    msg: 'Bạn đã truy cập route được bảo vệ!', 
    userId: req.user.id
  });
});

// --- Khởi động Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { // <-- ĐÃ XÓA "async"
  // await setupEthereal(); // <-- ĐÃ XÓA LỆNH GỌI NÀY
  console.log(`Server đang chạy trên cổng ${PORT}`);
});