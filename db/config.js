const mysql = require('mysql2');

const pool = mysql.createPool({
  connectionLimit: 100, //important
  host: 'localhost',
  user: 'root',
  password: 'master1951',
  database: 'master',
  debug: false,
});

// const SelectAllProducts = () => {
//   return new Promise((resolve, reject) => {
//     pool.query('SELECT * FROM product ', (error, elements) => {
//       if (error) {
//         return reject(error);
//       }
//       return resolve(elements);
//     });
//   });
// };

module.exports = pool.promise();
//module.exports = pool;

//upobthli_newmasterdb
//upobthli_newmasterdb
//80jcF0Sd~H_P
