const jwt = require('jsonwebtoken');

const accessCheck = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json('Not authenticated.');

  jwt.verify(token, 'jwtkey', async (err, userInfo) => {
    if (err) return res.status(401).json('Token is not valid.');
    else if (userInfo.role !== 'admin')
      return res.status(403).json('Access denied');
    else next();
  });
};

module.exports = { accessCheck };
