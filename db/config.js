var mysql = require('mysql2');

const pool = mysql.createPool({
  connectionLimit: 100, //important
  host: 'localhost',
  user: 'root',
  password: 'master1951',
  database: 'master',
  debug: false,
});

module.exports = pool;

//upobthli_newmasterdb
//upobthli_newmasterdb
//80jcF0Sd~H_P
