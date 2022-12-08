const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const filtrationData = require('../utils/createFilterData.js');

class filtrationController {
  async parseParams(req, res) {
    try {
      const { url } = req.params;
      const { brands } = req.body;

      let q = Queries.getFiltredProductsByManufacturerAndCategory;

      if (brands.length) q += ` AND p.manufacturer_id IN(${brands.join(', ')})`;

      const [rows, filds] = await pool.query(q, [url]);

      const filtredByManufacturerAndCategoryData =
        filtrationData.formatData(rows);

      const filtratredByParams = filtrationData.filtrationByParams(
        filtredByManufacturerAndCategoryData,
        req.body.filter_params
      );

      const filtratedProducts = filtrationData.filtrationdByPrice(
        filtratredByParams,
        req.body.min_price,
        req.body.max_price,
        req.body.currency
      );

      const [rows2, filds2] = await pool.query(
        Queries.getProductsByIds +
          `AND pl.product_id IN(${filtratedProducts
            .map((el) => el.id)
            .join(', ')})`
      );

      return res.status(200).json(rows2);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new filtrationController();
