const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

class historyController {
  async getHistoryByProductUrl(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getHistoryByProductUrl, [
        req.params.url,
        language_id,
      ]);

      if (!rows.length) {
        const [rows2, filds2] = await pool.query(
          Queries.getHistoryProductInParentGroupByUrls,
          [url, language_id, language_id]
        );
        return res.status(200).json(rows2);
      } else return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getHistoryProductInParentGroupByUrls(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getHistoryProductInParentGroupByUrls,
        [req.params.url, language_id, language_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getHistoryByGroupUrl(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getHistoryByGroupUrl, [
        req.params.url,
        language_id,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new historyController();
