const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

class newsController {
  getAllNews(req, res) {
    try {
      pool.getConnection((error, connection) => {
        connection.query(Queries.getAllNews, (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        });

        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }

  getOneNewById(req, res) {
    try {
      const { id } = req.params;

      pool.getConnection((error, connection) => {
        connection.query(Queries.getOneNewById, [id], (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        });

        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new newsController();
