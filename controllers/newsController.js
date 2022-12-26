const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

class newsController {
  async getAllNews(req, res) {
    try {
      const { language_id } = res.locals;
      const [rows, filds] = await pool.query(Queries.getAllNews, [language_id]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getOneNewById(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getOneNewById, [
        language_id,
        req.params.id,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new newsController();
