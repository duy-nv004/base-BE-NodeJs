const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Dịch vụ gửi email
 * @param {string} to - Email người nhận
 * @param {string} subject - Chủ đề email
 * @param {string} text - Nội dung (dạng text)
 */
const sendEmail = async (to, subject, text) => {
  
  // Tạo transporter (đối tượng gửi mail) dùng cấu hình Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Sử dụng dịch vụ Gmail
    auth: {
      user: process.env.EMAIL_USER, // Email Gmail của bạn từ .env
      pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự từ .env
    },
  });

  // Nội dung email
  const mailOptions = {
    from: `"Dịch vụ Auth" <${process.env.EMAIL_USER}>`, // Gửi từ chính email của bạn
    to: to,
    subject: subject,
    text: text,
  };

  try {
    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log('Đã gửi email (Gmail): %s', info.messageId);
    
    // Sẽ không còn link Ethereal nữa
    
  } catch (error) {
    console.error('Lỗi khi gửi email (Gmail):', error);
  }
};

module.exports = sendEmail;