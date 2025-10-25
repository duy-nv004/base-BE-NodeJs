const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Khởi tạo đối tượng Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    logging: false, // Tắt log
    dialectOptions: {
      options: {
        encrypt: true,
        // trustServerCertificate: true // Bật nếu dùng SQL Server local
      }
    }
  }
);

// Hàm kiểm tra kết nối
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối SQL Server thành công.');
  } catch (error) {
    console.error('Không thể kết nối đến SQL Server:', error);
  }
};

module.exports = { sequelize, connectDB };