const mysql = require('mysql2');
const config = require('./db_config.js');
const pool = mysql.createPool(config);

exports.getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        return reject(err);
      }
      resolve(connection);
    });
  });
};
