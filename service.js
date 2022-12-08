const db = require('./db.js');

async function query(sql, params = []) {
  const connection = await db.getConnection();
  const [results] = await connection.query(sql, params);
  console.log(results);
  return results;
}

module.exports = {
  query,
};
