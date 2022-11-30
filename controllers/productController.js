const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');

const path = require('path');
const { readdir } = require('fs').promises;

function getProductsWithDiscount(req, res) {
  try {
    pool.getConnection((error, connection) => {
      connection.query(Queries.getProductsWithDiscount, (err, data) => {
        if (err) throw err;
        else return res.status(200).json(data);
      });
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getNewProducts(req, res) {
  try {
    pool.getConnection((error, connection) => {
      connection.query(Queries.getNewProducts, (err, data) => {
        if (err) throw err;
        return res.status(200).json(data);
      });
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getOneProductByUrl(req, res) {
  try {
    const url = req.params.url.replace('tovar_', '');
    pool.getConnection((err, connection) => {
      connection.query(Queries.getOneProductByUrl, [url], (err, data) => {
        if (err) throw err;
        else return res.status(200).json(data);
      });
      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getProductsByIds(req, res) {
  try {
    const { ids } = req.body;
    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getProductsByIds +
          `AND pl.product_id IN(${Array.from(ids).join(', ')})`,
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

function getProductCharacteristicsById(req, res) {
  try {
    const { id } = req.params;

    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getProductCharacteristicsById,
        [id],
        (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        }
      );

      connection.release();
    });
  } catch (error) {
    consolr.log(error);
  }
}

function getProductsPropertiesProducts(req, res) {
  try {
    const { id } = req.params;

    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getProductsPropertiesProducts + `AND prp.product_id IN(?)`,
        [id],
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

function getAllProductPhotosById(req, res) {
  try {
    const { id } = req.params;

    pool.getConnection((error, connection) => {
      connection.query(Queries.getAllProductPhotosById, [id], (err, data) => {
        if (err) throw err;
        else return res.status(200).json(data);
      });

      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

async function getProductImage(req, res) {
  try {
    const dir = `/static/product/${req.params.id}`;
    const dirents = await readdir(path.resolve() + dir, (err) => {
      if (err) throw new Error(err);
    });
    res.redirect(`http://localhost:8000${dir}/${dirents[0]}`);
  } catch (error) {
    console.log(error);
  }
}

function getCompareProductCharacteristicsValuesById(req, res) {
  try {
    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getCompareProductCharacteristicsValuesById,
        [req.params.id],
        (err, data) => {
          if (err) throw err;
          else
            return res.status(200).json({
              [req.params.id]: data,
            });
        }
      );

      connection.release();
    });
  } catch (error) {
    console.log(error);
  }
}

function getPropertiesCompareProducts(req, res) {
  try {
    const { data } = req.body;
    if (!data.length) {
      return res.json([]);
    }
    pool.getConnection((error, connection) => {
      connection.query(
        Queries.getProductsPropertiesProducts +
          ` AND prp.product_id IN(${Array.from(data).join(', ')})`,
        (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getProductsWithDiscount,
  getNewProducts,
  getOneProductByUrl,
  getProductsByIds,
  getProductCharacteristicsById,
  getProductsPropertiesProducts,
  getAllProductPhotosById,
  getProductImage,
  getCompareProductCharacteristicsValuesById,
  getPropertiesCompareProducts,
};
