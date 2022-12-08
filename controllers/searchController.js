const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

class searchController {
  async getSearchProductsByValues(req, res) {
    try {
      const group_url = req.params.groupUrl;
      const search_value = `%${req.params.searchValue}%`;
      const page = req.params.page;

      const qtyItemsPage = 8;
      const startingLimit = (page - 1) * qtyItemsPage;

      if (group_url) {
        const [rows, filds] = await pool.query(Queries.checkTypeOfGroup, [
          group_url.replace('group_', ''),
        ]);

        if (!rows.length) {
          const cleact_url = group_url.replace('group_', '');
          const [rows2, filds2] = await pool.query(
            Queries.getSearchProductsInSubcategory,
            [
              cleact_url,
              search_value,
              search_value,
              cleact_url,
              cleact_url,
              cleact_url,
            ]
          );

          const numberOfPages = Math.ceil(rows2.length / qtyItemsPage);
          const [rows3, filds3] = await pool.query(
            Queries.getSearchProductsInSubcategory +
              ` LIMIT ${startingLimit}, ${qtyItemsPage}`,
            [
              cleact_url,
              search_value,
              search_value,
              cleact_url,
              cleact_url,
              cleact_url,
            ]
          );

          return res.status(200).json({
            data: rows3,
            type: 'product',
            pageQty: numberOfPages,
          });
        } else {
          const clean_url = group_url.replace('group_', '');
          const [rows, filds] = await pool.query(
            Queries.getSearchProductsInParentGroup,
            [search_value, clean_url]
          );

          return res.status(200).json({
            data: rows,
            type: 'category',
          });
        }
      }

      if (search_value && !group_url) {
        const [rows, filds] = await pool.query(
          Queries.getSearchProductsFromMainPage,
          [search_value, search_value, search_value.replace('%', '')]
        );

        const numberOfPages = Math.ceil(rows.length / qtyItemsPage);

        const [rows2, filds2] = await pool.query(
          Queries.getSearchProductsFromMainPage +
            ` LIMIT ${startingLimit}, ${qtyItemsPage}`,
          [search_value, search_value, search_value.replace('%', '')]
        );

        return res.status(200).json({
          data: rows2,
          type: 'product',
          pageQty: numberOfPages,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new searchController();
