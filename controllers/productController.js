const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const jwt = require('jsonwebtoken');
const path = require('path');
const { readdir } = require('fs').promises;
const date = require('date-and-time');

class productController {
  getProductById(req, res) {
    try {
      const id = req.params.id;
      pool.getConnection((err, connection) => {
        const q = Queries.getOneProduct + `AND pl.product_id = ?`;
        connection.query(q, [id], (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        });
        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }

  getProductsPropertiesProductsId(req, res) {
    try {
      const id = req.params.id;
      const q = `SELECT distinct relation_product_id AS product_id FROM product_rel_product prp WHERE prp.product_id = ?`;
      pool.getConnection((err, connection) => {
        connection.query(q, [id], (err, data) => {
          if (err) throw err;
          else return res.status(200).json(data);
        });
        connection.release();
      });
    } catch (error) {
      console.log(error);
    }
  }

  getProductsWithDiscount(req, res) {
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

  getNewProducts(req, res) {
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

  getOneProductByUrl(req, res) {
    try {
      const url = req.params.url.replace('tovar_', '');
      pool.getConnection((err, connection) => {
        const q = Queries.getOneProduct + `AND pl.url = ?`;
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

  getProductsByIds(req, res) {
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

  getProductCharacteristicsById(req, res) {
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

  getProductsPropertiesProducts(req, res) {
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

  getAllProductPhotosById(req, res) {
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

  async getProductImage(req, res) {
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

  getCompareProductCharacteristicsValuesById(req, res) {
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

  getPropertiesCompareProducts(req, res) {
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

  updateProduct(req, res) {
    try {
      const token = req.cookies.access_token;
      if (!token) return res.status(401).json('Not authenticated.');

      const { id } = req.params;
      const { product, photos } = req.body;

      const languageParams = [
        product.product_name,
        product.description,
        product.url,
        product.meta_title,
        product.meta_keywords,
        product.meta_description,
      ];

      const priceParams = [
        product.base_price,
        product.currency_id,
        product.discount_percent || null,
      ];

      jwt.verify(token, 'jwtkey', (err, userInfo) => {
        if (err) return res.status(401).json('Token is not valid.');
        if (userInfo.role !== 'admin') res.status(403).json('Access denied');

        pool.getConnection((error, connection) => {
          connection.query(
            Queries.updateProductLanguage,
            [...languageParams, id],
            (err, data) => {
              if (err) throw err;
            }
          );

          connection.query(
            Queries.updateProductPrice,
            [...priceParams, id],
            (err, data) => {
              if (err) throw err;
            }
          );

          const now = new Date();
          const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

          connection.query(
            `UPDATE product p SET t_updated = ? WHERE p.id = ?;`,
            [formatDate, id],
            (err, data) => {
              if (err) throw err;
            }
          );

          connection.release();
          return res.status(200);
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  createProduct(req, res) {
    try {
      const token = req.cookies.access_token;
      if (!token) return res.status(401).json('Not authenticated.');

      jwt.verify(token, 'jwtkey', (err, userInfo) => {
        if (err) return res.status(401).json('Token is not valid.');
        if (userInfo.role !== 'admin') res.status(403).json('Access denied');

        const product = req.body;

        pool.getConnection((error, connection) => {
          const now = new Date();
          const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

          const productParams = [
            formatDate,
            formatDate,
            product.manufacturer_id,
            product.guarantee,
          ];

          connection.query(
            Queries.createProduct,
            [productParams],
            (err, data) => {
              if (err) throw err;
              const { insertId } = data;

              const languageParams = [
                product.product_name,
                product.description,
                product.url,
                product.meta_title,
                product.meta_keywords,
                product.meta_description,
                insertId,
              ];

              const priceParams = [
                product.base_price,
                product.currency_id,
                product.discount_percent || null,
                insertId,
              ];

              connection.query(
                Queries.createProductLanguage,
                [languageParams],
                (err, data) => {
                  if (err) throw err;
                  console.log('Languale has been created');
                }
              );

              connection.query(
                Queries.createProductPrice,
                [priceParams],
                (err, data) => {
                  if (err) throw err;
                  console.log('Price has been created');
                }
              );

              connection.query(
                Queries.createProductCategory,
                [insertId, product.category_id],
                (err, data) => {
                  if (err) throw err;
                  console.log('Product-Category was created');
                }
              );
            }
          );

          connection.release();
          return res.status(200);
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  getAllManufacturers(req, res) {
    try {
      pool.getConnection((error, connection) => {
        connection.query(Queries.getAllManufacturers, (err, data) => {
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

module.exports = new productController();
