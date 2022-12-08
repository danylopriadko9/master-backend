const pool = require('../db/config.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');

class authorizationController {
  async register(req, res) {
    try {
      // check existing user
      const q = ' SELECT * FROM user WHERE email = ? OR username = ?';

      const [rows, filds] = await pool.query(q, [
        req.body.email,
        req.body.username,
      ]);
      if (rows.length) return res.status(409).json('User already exists!');

      // hash the password and create a user
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);

      const q2 =
        'INSERT INTO user(`username`, `email`, `password_hash`, `status`, `created_at`, `updated_at`, `role`) VALUES (?)';

      const now = new Date();
      const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');
      const values = [
        req.body.username,
        req.body.email,
        hash,
        10,
        formatDate,
        formatDate,
        `user`,
      ];

      await pool.query(q2, [values]);
      return res.status(200).json('User has been created.');
    } catch (error) {
      console.log(error);
    }
  }

  async login(req, res) {
    try {
      const q = 'SELECT * FROM user WHERE username = ?';

      const [rows, fileds] = await pool.query(q, [req.body.username]);
      if (rows.length === 0) return res.status(404).json('User not found!');

      //Check password
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        rows[0].password_hash
      );

      if (!isPasswordCorrect)
        return res.status(400).json('Wrong username or password!');

      const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, 'jwtkey');
      const { password_hash, ...other } = rows[0];

      res
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .status(200)
        .json(other);
    } catch (error) {
      console.log(error);
    }
  }

  async logout(req, res) {
    try {
      res
        .clearCookie('access_token', {
          sameSite: 'none',
          secture: true,
        })
        .status(200)
        .json('User has been logged out.');
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new authorizationController();
