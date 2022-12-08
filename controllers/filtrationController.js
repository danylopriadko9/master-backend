const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const filtrationData = require('../utils/createFilterData.js');

class filtrationController {
  parseParams(req, res) {
    try {
      const { url } = req.params;
      const { brands } = req.body;

      let q = Queries.getFiltredProductsByManufacturerAndCategory;

      if (brands.length) {
        q += ` AND p.manufacturer_id IN(${brands.join(', ')})`;
      }

      pool.getConnection((error, connection) => {
        connection.query(q, [url], (err, data) => {
          if (err) throw err;
          else {
            const filtredByManufacturerAndCategoryData =
              filtrationData.formatData(data);

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

            if (!filtratedProducts.length) {
              return res.status(200).json([]);
            }

            connection.query(
              Queries.getProductsByIds +
                `AND pl.product_id IN(${filtratedProducts
                  .map((el) => el.id)
                  .join(', ')})`,
              (err, data) => {
                if (err) throw err;
                else return res.status(200).json(data);
              }
            );
          }
        });

        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new filtrationController();
