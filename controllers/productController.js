const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const date = require('date-and-time');
const multer = require('multer');

// create multer storage for products images upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('uploads/static'));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0]
    );
  },
});
const multi_upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpeg' ||
      file.mimetype == 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .jpg .jpeg .png images are supported!');
      err.name = 'ExtensionError';
      return cb(err);
    }
  },
}).array('uploadImages', 10);

class productController {
  async test(req, res) {
    try {
      const { id } = req.params;
      const product_id = id;
      const { language_id } = res.locals;
      const data = req.body;

      const q = `
      SELECT pvl.name, prpv.property_id, prpv.property_value_id 
      FROM property_value_lang pvl 
      JOIN product_rel_property_value prpv 
        ON prpv.property_value_id = pvl.property_value_id 
      WHERE prpv.product_id = ?
      AND pvl.language_id = ?
      AND prpv.status = 'enabled'
      `;

      const [productCharacteristics] = await pool.query(q, [
        product_id,
        language_id,
      ]);

      // сравниваю поступившие данные
      data.forEach(async (el) => {
        if (!el.value.length) {
          await pool.query(
            `UPDATE product_rel_property_value SET status = 'disabled' WHERE product_id = ? AND property_id = ?;`,
            [product_id, el.property_id]
          );

          return;
        }

        const check = productCharacteristics.find(
          (e) => e.property_id === el.property_id
        );

        if (!check) {
          const [rows] = await pool.query(
            `SELECT property_value_id FROM property_value_lang WHERE name = ?`,
            [el.value]
          );

          if (rows.length > 0) {
            await pool.query(
              `INSERT INTO product_rel_property_value(product_id, property_id, property_value_id, status) VALUES(?, ?, ?, ?)`,
              [product_id, el.property_id, rows[0].property_value_id, 'enabled']
            );
          } else {
            const now = new Date();
            const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

            const [rows2] = await pool.query(
              `INSERT INTO property_value(t_created, t_updated, property_id) VALUES(?, ?, ?)`,
              [formatDate, formatDate, el.property_id]
            );
            await pool.query(
              `INSERT INTO property_value_lang(property_value_id, language_id, name) VALUES(?, ?, ?)`,
              [rows2.insertId, language_id, el.value]
            );
            await pool.query(
              `INSERT INTO product_rel_property_value(product_id, property_id, property_value_id, status) VALUES(?, ?, ?, ?)`,
              [product_id, el.property_id, rows2.insertId, 'enabled']
            );
          }
          return;
        }

        if (el.value !== check.name) {
          const now = new Date();
          const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

          const [rows2] = await pool.query(
            `INSERT INTO property_value(t_created, t_updated, property_id) VALUES(?, ?, ?)`,
            [formatDate, formatDate, el.property_id]
          );

          await pool.query(
            `INSERT INTO property_value_lang(property_value_id, language_id, name) VALUES(?, ?, ?)`,
            [rows2.insertId, language_id, el.value]
          );

          await pool.query(
            `UPDATE product_rel_property_value SET property_value_id = ? WHERE product_id = ? AND property_id = ? AND status = 'enabled';`,
            [rows2.insertId, product_id, el.property_id]
          );
        }
      });

      return res.status(200).json('Success');
    } catch (error) {
      console.log(error);
    }
  }

  async getProductById(req, res) {
    try {
      const { language_id } = res.locals;
      const [rows, filds] = await pool.query(
        Queries.getOneProduct + `AND pl.product_id = ?`,
        [language_id, language_id, req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async changeRelationProducts(req, res) {
    try {
      const params = req.body;

      await pool.query(`DELETE FROM product_rel_product WHERE product_id = ?`, [
        req.params.id,
      ]);

      const now = new Date();
      const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

      params.forEach(async (el) => {
        const set = [formatDate, req.params.id, el.product_id];

        await pool.query(
          `INSERT INTO product_rel_product(t_created, product_id, relation_product_id) VALUES (?)`,
          [set]
        );
      });
      return res.status(200).json('Success');
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsRelationProductsById(req, res) {
    try {
      const q = `SELECT distinct relation_product_id AS product_id FROM product_rel_product prp WHERE prp.product_id = ?`;
      const [rows, filds] = await pool.query(q, [req.params.id]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsWithDiscount(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getProductsWithDiscount, [
        language_id,
        language_id,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getNewProducts(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getNewProducts, [
        language_id,
        language_id,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getOneProductByUrl(req, res) {
    try {
      const { language_id } = res.locals;
      const url = req.params.url.replace('tovar_', '');

      const [rows, filds] = await pool.query(
        Queries.getOneProduct + `AND pl.url = ?`,
        [language_id, language_id, url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsByIds(req, res) {
    try {
      const { ids } = req.body;
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getProductsByIds +
          `AND pl.product_id IN(${Array.from(ids).join(', ')})`,
        [language_id, language_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductCharacteristicsById(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getProductCharacteristicsById,
        [language_id, language_id, req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsPropertiesProducts(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getProductsPropertiesProducts,
        [language_id, language_id, req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getAllProductPhotosById(req, res) {
    try {
      const [rows, filds] = await pool.query(Queries.getAllProductPhotosById, [
        req.params.id,
      ]);

      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductImage(req, res) {
    try {
      const [rows, filds] = await pool.query(
        `SELECT * FROM product_image
      where product_id = ?
      and type = 'main'`,
        [req.params.id]
      );

      const { filename } = rows[0];

      return res
        .status(200)
        .json(
          `http://localhost:8000/static/product/${req.params.id}/${filename}`
        );
    } catch (error) {
      console.log(error);
    }
  }

  async getCompareProductCharacteristicsValuesById(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getCompareProductCharacteristicsValuesById,
        [language_id, language_id, req.params.id]
      );
      return res.status(200).json({
        [req.params.id]: rows,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getPropertiesCompareProducts(req, res) {
    try {
      const { language_id } = res.locals;

      const { data } = req.body;
      if (!data.length) {
        return res.status(200).json([]);
      }

      const [rows, filds] = await pool.query(
        Queries.getProductsPropertiesProducts +
          ` AND prp.product_id IN(${Array.from(data).join(', ')})`,
        [language_id, language_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async updateProduct(req, res) {
    try {
      const token = req.cookies.access_token;
      if (!token) return res.status(401).json('Not authenticated.');

      const { language_id } = res.locals;

      const { id } = req.params;
      const { product } = req.body;

      const [productInfo] = await pool.query(
        `SELECT category_id FROM product_category WHERE product_id = ?`,
        [id]
      );

      if (productInfo[0].category_id !== product.category_id) {
        await pool.query(
          `UPDATE product_rel_property_value SET status = 'disabled' WHERE product_id = ?`,
          [id]
        );
        await pool.query(
          `UPDATE product_category SET category_id = ? WHERE product_id = ?`,
          [product.category_id, id]
        );
      }

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

      jwt.verify(token, 'jwtkey', async (err, userInfo) => {
        if (err) return res.status(401).json('Token is not valid.');
        if (userInfo.role !== 'admin') res.status(403).json('Access denied');

        const now = new Date();
        const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

        await pool.query(Queries.updateProductLanguage, [
          ...languageParams,
          id,
          language_id,
        ]);

        await pool.query(Queries.updateProductPrice, [...priceParams, id]);

        await pool.query(`UPDATE product p SET t_updated = ? WHERE p.id = ?;`, [
          formatDate,
          id,
        ]);

        return res.status(200);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async uploadPhotos(req, res) {
    try {
      if (req.files.length) {
        req.files.forEach(async (el) => {
          const data = [
            req.params.id,
            `static/product/${req.params.id}`,
            el.filename,
            el.type,
          ];

          await pool.query(
            'INSERT INTO product_image (product_id, dir_path, filename, type) VALUES (?);',
            [data]
          );
        });
      }

      return res.status(200).json('Success');
    } catch (error) {
      console.log(error);
    }
  }

  async checkAndDeletePhotos(req, res) {
    try {
      const filePath = path.join(
        __dirname,
        `../static/product/${req.params.id}`
      );

      const photosNames = req.body;

      if (fs.readdirSync(filePath).length !== photosNames.length) {
        fs.readdirSync(filePath).forEach(async (el) => {
          if (!photosNames.filter((e) => e.filename === el).length) {
            await pool.query(`DELETE FROM product_image WHERE filename=?`, [
              el,
            ]);
            fs.unlinkSync(`${filePath}/${el}`);
          }
        });
      }

      photosNames.forEach(async (el) => {
        if (el.type === 'main') {
          await pool.query(
            `UPDATE product_image SET type = "general" WHERE type = 'main' AND product_id = ?`,
            [req.params.id]
          );

          await pool.query(
            `UPDATE product_image SET type = 'main' WHERE product_id = ? AND filename = ?`,
            [req.params.id, el.filename]
          );
        }
      });

      return res.status(200).json(filePath);
    } catch (error) {
      console.log(error);
    }
  }

  async createProduct(req, res) {
    try {
      const token = req.cookies.access_token;
      if (!token) return res.status(401).json('Not authenticated.');

      jwt.verify(token, 'jwtkey', async (err, userInfo) => {
        if (err) return res.status(401).json('Token is not valid.');
        if (userInfo.role !== 'admin') res.status(403).json('Access denied');

        const product = req.body;

        console.log(product.category_id, req.body.category_id);

        const { language_id } = res.locals;

        const now = new Date();
        const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

        const productParams = [
          formatDate,
          formatDate,
          product.manufacturer_id,
          product.guarantee,
        ];

        const [rows, filds] = await pool.query(Queries.createProduct, [
          productParams,
        ]);
        const { insertId } = rows;

        await fs.promises.mkdir(`static/product/${insertId}`);

        const languageParams = [
          product.product_name,
          product.description,
          product.url,
          product.meta_title,
          product.meta_keywords,
          product.meta_description,
          insertId,
          language_id,
        ];

        const priceParams = [
          product.base_price,
          product.currency_id,
          product.discount_percent || null,
          insertId,
        ];

        await pool.query(Queries.createProductLanguage, [languageParams]);
        await pool.query(Queries.createProductPrice, [priceParams]);
        await pool.query(Queries.createProductCategory, [
          insertId,
          product.category_id,
        ]);

        return res.status(200);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllManufacturers(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getAllManufacturers, [
        language_id,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new productController();
