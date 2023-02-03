const { Queries } = require('../db/queries.js');
const pool = require('../db/config.js');

class productsController {
  async getProductsByIds(req, res) {
    try {
      const { productIds } = req.body;
      const { language_id } = res.locals;

      console.log('get Products By Ids Before Query' + Date.parse());

      const [rows] = await pool.query(Queries.getProductsByIds, [
        language_id,
        language_id,
        productIds,
      ]);

      console.log('get Products By Ids After Query' + Date.parse());

      return res.status(200).json({
        products: rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new productsController();
