const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

const path = require('path');
const { readdir } = require('fs').promises;

async function getCategoryPhoto(req, res) {
  try {
    const dir = `/static/category/${req.params.id}`;
    const dirents = await readdir(path.resolve() + dir, (err) => {
      if (err) throw new Error(err);
    });
    res.redirect(`http://localhost:8000${dir}/${dirents[0]}`);
  } catch (error) {
    console.log(error);
  }
}

function getAllCategories(req, res) {
  try {
    pool.getConnection((err, connection) => {
      connection.query(Queries.getAllCategories, (err, data) => {
        if (err) throw err;
        else return res.status(200).json(data);
      });

      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getProductsByCaregory(req, res) {
  try {
    const url = req.params.url;

    pool.getConnection((error, connection) => {
      connection.query(Queries.getProductsByCaregory, [url], (err, data) => {
        if (err) throw err;
        return res.status(200).json(data);
      });
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getProductsFromOnePageByCategory(req, res) {
  try {
    const page = req.params.page;
    const qtyItemsPage = 8;
    const startingLimit = (page - 1) * qtyItemsPage;

    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getProductsByCaregory,
        [req.params.url],
        (err, data) => {
          if (err) throw err;
          const numberOfResult = data.length;
          const numberOfPages = Math.ceil(data.length / qtyItemsPage);

          connection.query(
            Queries.getProductsFromOnePageByCategory,
            [req.params.url, startingLimit, qtyItemsPage],
            (err, data) => {
              if (err) throw err;
              return res.status(200).json({
                data,
                numberOfResult,
                numberOfPages,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
}

function getSubcategoryProductsByUrl(req, res) {
  try {
    const { url } = req.params;
    pool.getConnection((error, connection) => {
      connection.query(Queries.getProductsByCaregory, [url], (err, data) => {
        if (err) throw err;
        else return res.status(200).json(data);
      });

      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getFiltredProductsByManufacturerAndCategory(req, res) {
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
        else return res.status(200).json(data);
      });

      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getManufacturersAndQtyOfProducts(req, res) {
  try {
    const url = req.params.url;
    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getManufacturersAndQtyOfProducts,
        [url],
        (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        }
      );
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getCharacteristicsCategory(req, res) {
  try {
    const { url } = req.params;

    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getCharacteristicsCategory,
        [url],
        (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        }
      );
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getFiltrationParamsByCategory(req, res) {
  try {
    const { url } = req.params;

    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getFiltrationParamsByCategory,
        [url],
        (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        }
      );
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getSubcategoriesByCategoryUrl(req, res) {
  try {
    const { url } = req.params;

    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getSubcategoriesByCategoryUrl,
        [url],
        (err, data) => {
          if (err) throw err;

          return res.status(200).json(data);
        }
      );

      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getFiltrationCharacteristictAndParams(req, res) {
  try {
    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getCharacteristicsCategory,
        [req.params.url],
        (err, data) => {
          if (err) throw err;

          connection.query(
            Queries.getFiltrationParamsByCategory,
            [req.params.url],
            (err, secoundData) => {
              if (err) throw err;

              const response_obj = {};
              secoundData.forEach((el) => {
                if (response_obj.hasOwnProperty(el.property_id)) {
                  const prop_status = response_obj[el.property_id].includes(
                    el.name
                  );
                  if (!prop_status && el.name.length)
                    response_obj[el.property_id].push(el.name);
                } else {
                  if (el.name.length > 0) {
                    response_obj[el.property_id] = [el.name];
                  }
                }
              });

              return res.json({
                characteriscics: data,
                values: response_obj,
              });
            }
          );
        }
      );
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getAllCategories,
  getProductsByCaregory,
  getProductsFromOnePageByCategory,
  getSubcategoryProductsByUrl,
  getFiltredProductsByManufacturerAndCategory,
  getManufacturersAndQtyOfProducts,
  getCharacteristicsCategory,
  getFiltrationParamsByCategory,
  getSubcategoriesByCategoryUrl,
  getFiltrationCharacteristictAndParams,
  getCategoryPhoto,
};
