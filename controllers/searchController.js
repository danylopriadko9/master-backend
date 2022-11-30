const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

function getSearchProductsByValues(req, res) {
  try {
    const group_url = req.params.groupUrl;
    const search_value = `%${req.params.searchValue}%`;
    const page = req.params.page;

    console.log(group_url, search_value, page);

    const qtyItemsPage = 8;
    const startingLimit = (page - 1) * qtyItemsPage;

    pool.getConnection((error, connection) => {
      if (group_url) {
        //запрос на группу, родительская ли она

        connection.query(
          Queries.checkTypeOfGroup,
          [group_url.replace('group_', '')],
          (err, data) => {
            if (err) throw err;

            // если не родительская
            if (!data.length) {
              const cleact_url = group_url.replace('group_', '');

              connection.query(
                Queries.getSearchProductsInSubcategory,
                [
                  cleact_url,
                  search_value,
                  search_value,
                  cleact_url,
                  cleact_url,
                  cleact_url,
                ],
                (err, data) => {
                  if (err) throw err;
                  const numberOfPages = Math.ceil(data.length / qtyItemsPage);
                  connection.query(
                    Queries.getSearchProductsInSubcategory +
                      ` LIMIT ${startingLimit}, ${qtyItemsPage}`,
                    [
                      cleact_url,
                      search_value,
                      search_value,
                      cleact_url,
                      cleact_url,
                      cleact_url,
                    ],
                    (err, data) => {
                      if (err) throw err;

                      return res.status(200).json({
                        data: data,
                        type: 'product',
                        pageQty: numberOfPages,
                      });
                    }
                  );
                }
              );
              return;
            } else {
              // если родительская
              const clean_url = group_url.replace('group_', '');
              connection.query(
                Queries.getSearchProductsInParentGroup,
                [search_value, clean_url],
                (err, data) => {
                  if (err) console.log(err);
                  return res.status(200).json({
                    data: data,
                    type: 'category',
                  });
                }
              );
              connection.release();
              return;
            }
          }
        );
      }
      // если ищем с главной страницы
      if (search_value && !group_url) {
        connection.query(
          Queries.getSearchProductsFromMainPage,
          [search_value, search_value, search_value],
          (err, data) => {
            if (err) throw err;
            const numberOfPages = Math.ceil(data.length / qtyItemsPage);

            connection.query(
              Queries.getSearchProductsFromMainPage +
                ` LIMIT ${startingLimit}, ${qtyItemsPage}`,
              [search_value, search_value, search_value],
              (err, data) => {
                if (err) throw err;
                return res.status(200).json({
                  data: data,
                  type: 'product',
                  pageQty: numberOfPages,
                });
              }
            );
          }
        );
      }
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getSearchProductsByValues };
