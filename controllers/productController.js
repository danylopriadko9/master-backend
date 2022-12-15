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
  async getProductById(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getOneProduct + `AND pl.product_id = ?`,
        [req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsPropertiesProductsId(req, res) {
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
      const [rows, filds] = await pool.query(Queries.getProductsWithDiscount);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getNewProducts(req, res) {
    try {
      const [rows, filds] = await pool.query(Queries.getNewProducts);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getOneProductByUrl(req, res) {
    try {
      const url = req.params.url.replace('tovar_', '');

      const [rows, filds] = await pool.query(
        Queries.getOneProduct + `AND pl.url = ?`,
        [url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsByIds(req, res) {
    try {
      const { ids } = req.body;
      const [rows, filds] = await pool.query(
        Queries.getProductsByIds +
          `AND pl.product_id IN(${Array.from(ids).join(', ')})`
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductCharacteristicsById(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getProductCharacteristicsById,
        [req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsPropertiesProducts(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getProductsPropertiesProducts + `AND prp.product_id IN(?)`,
        [req.params.id]
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
        `SELECT * FROM master.product_image
      where product_id = ?
      and type = 'main'`,
        [req.params.id]
      );

      const { dir_path, filename } = rows[0];

      return res.status(200).json(`/${dir_path}/${filename}`);
    } catch (error) {
      console.log(error);
    }
  }

  async getCompareProductCharacteristicsValuesById(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getCompareProductCharacteristicsValuesById,
        [req.params.id]
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
      const { data } = req.body;
      if (!data.length) {
        return res.status(200).json([]);
      }

      const [rows, filds] = await pool.query(
        Queries.getProductsPropertiesProducts +
          ` AND prp.product_id IN(${Array.from(data).join(', ')})`
      );
      return res.status(200).json({
        [req.params.id]: rows,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateProduct(req, res) {
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

      jwt.verify(token, 'jwtkey', async (err, userInfo) => {
        if (err) return res.status(401).json('Token is not valid.');
        if (userInfo.role !== 'admin') res.status(403).json('Access denied');

        const now = new Date();
        const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

        await pool.query(Queries.updateProductLanguage, [
          ...languageParams,
          id,
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
            'main',
          ];
          console.log(data);
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

      fs.readdirSync(filePath).forEach(async (el) => {
        if (!photosNames.filter((e) => e.filename === el).length) {
          await pool.query(`DELETE FROM product_image WHERE filename=?`, [el]);
          fs.unlinkSync(`${filePath}/${el}`);
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
      const [rows, filds] = await pool.query(Queries.getAllManufacturers);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new productController();
