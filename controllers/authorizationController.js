const pool = require('../db/config.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');

class authorizationController {
  register(req, res) {
    // check existing user
    try {
      const q = ' SELECT * FROM user WHERE email = ? OR username = ?';

      pool.getConnection((error, connection) => {
        connection.query(
          q,
          [req.body.email, req.body.username],
          (err, data) => {
            if (err) throw err;
            else {
              if (data.length)
                return res.status(409).json('User already exists!');

              // hash the password and create a user
              const salt = bcrypt.genSaltSync(10);
              const hash = bcrypt.hashSync(req.body.password, salt);

              const q =
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

              connection.query(q, [values], (err, data) => {
                if (err) throw err;
                else return res.status(200).json('User has been created.');
              });
            }
          }
        );
        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }

  login(req, res) {
    try {
      const q = 'SELECT * FROM user WHERE username = ?';

      pool.getConnection((error, connection) => {
        connection.query(q, [req.body.username], (err, data) => {
          if (err) return res.status(500).json(err);
          if (data.length === 0) return res.status(404).json('User not found!');

          //Check password
          const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            data[0].password_hash
          );

          if (!isPasswordCorrect)
            return res.status(400).json('Wrong username or password!');

          const token = jwt.sign(
            { id: data[0].id, role: data[0].role },
            'jwtkey'
          );
          const { password_hash, ...other } = data[0];

          res
            .cookie('access_token', token, {
              httpOnly: true,
            })
            .status(200)
            .json(other);
        });
        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }

  logout(req, res) {
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
