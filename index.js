const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

// --- Kết nối CSDL ---
const { sequelize, connectDB } = require('./src/config/db');
connectDB();

// --- Import Models ---
// Import User để sequelize biết về model này
const User = require('./src/models/user');

// Khởi tạo app Express
const app = express();

// Middleware để đọc JSON body
app.use(express.json());

// --- Đồng bộ CSDL ---
// Dòng này sẽ tự động tạo bảng 'Users' trong CSDL của bạn
sequelize.sync({ force: false }) // false: không xóa bảng nếu đã tồn tại
  .then(() => {
    console.log('Đã đồng bộ hóa CSDL & model User!');
  })
  .catch(err => console.error('Lỗi đồng bộ CSDL:', err));


// --- Định nghĩa Routes ---
// Chỉ dùng auth routes
app.use('/api/auth', require('./src/routes/authRoutes'));

// --- (Tùy chọn) Một route được bảo vệ để test ---
const authMiddleware = require('./src/middleware/authMiddleware');

// Route này (GET /api/test) CHỈ chạy được nếu bạn gửi token hợp lệ
app.get('/api/test', authMiddleware, (req, res) => {
  res.json({ 
    msg: 'Bạn đã truy cập route được bảo vệ!', 
    userId: req.user.id // Lấy từ token
  });
});


// --- Khởi động Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});