const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Lấy token từ header
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Không có token, truy cập bị từ chối' });
  }

  try {
    // Token có dạng "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
       return res.status(401).json({ msg: 'Định dạng token không hợp lệ' });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Gán thông tin user vào request
    next(); // Cho phép đi tiếp
  } catch (err) {
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};