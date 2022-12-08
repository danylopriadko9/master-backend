const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

class historyController {
  getHistoryByProductUrl(req, res) {
    try {
      const { url } = req.params;

      pool.getConnection((error, connection) => {
        connection.query(Queries.getHistoryByProductUrl, [url], (err, data) => {
          if (err) throw err;

          if (!data.length) {
            pool.query(
              Queries.getHistoryProductInParentGroupByUrls,
              [url],
              (err, data) => {
                if (err) throw err;
                else return res.status(200).json(data);
              }
            );
          } else {
            return res.status(200).json(data);
          }
        });

        connection.release();
      });
    } catch (error) {}
  }

  getHistoryProductInParentGroupByUrls(req, res) {
    try {
      const { url } = req.params;

      pool.getConnection((error, connection) => {
        connection.query(
          Queries.getHistoryProductInParentGroupByUrls,
          [url],
          (err, data) => {
            if (err) throw err;
            else return res.status(200).json(data);
          }
        );

        connection.release();
      });
    } catch (error) {}
  }

  getHistoryByGroupUrl(req, res) {
    try {
      const { url } = req.params;

      pool.getConnection((error, connection) => {
        connection.query(Queries.getHistoryByGroupUrl, [url], (err, data) => {
          if (err) throw err;
          return res.status(200).json(data);
        });
        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new historyController();
