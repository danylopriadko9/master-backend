const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const path = require('path');
const { readdir } = require('fs').promises;

class categoryController {
  async filtration(req, res) {
    try {
      const params = req.body.params;

      const keys = Object.keys(params);
      const values = Object.values(params);

      // если нету продуктов подходящих по цене и производителю возващаем пустой обьект
      if (!res.locals.filtred_ids.length) {
        return res.status(200).json([]);
      }

      // проверна на наличие параметров фильтрации и возват отфильтрованных по цене и производителю товаров
      if (!keys.length && res.locals.filtred_ids.length) {
        console.log('dsdds');
        const [rows3, fields3] = await pool.query(
          Queries.getProductsByIds + `AND pc.product_id IN(?)`,
          [res.locals.filtred_ids]
        );

        return res.status(200).json(rows3);
      }

      let q = `
      SELECT DISTINCT p.id, prpv.property_id, prpv.property_value_id FROM product_rel_property_value prpv
      JOIN product p
        ON p.id = prpv.product_id
      JOIN product_category pc
        ON p.id = pc.product_id
      JOIN category_lang cl
        ON pc.category_id = cl.category_id
      AND cl.url = ? -- достаем url из запроса
      AND prpv.status = 'enabled'
      AND property_id = ? -- эти значение будут меняться
      AND property_value_id = ? --
      AND p.id IN (?)
      `;

      let result = [];

      const promises = keys.map(async (el, i) => {
        const [rows, filds] = await pool.query(q, [
          req.params.url,
          el,
          values[i],
          res.locals.filtred_ids,
        ]);

        if (!result.length) {
          result = rows.map((el) => el.id);
          return;
        }

        result = result.filter(
          (x) => rows.map((el) => el.id).indexOf(x) !== -1
        );
      });
      await Promise.all(promises);

      // если нету подходящих по парамметрам продуктов
      if (!result.length) {
        return res.status(200).json([]);
      }

      // ищем подходящие продукты по айди
      const [rows3, fields3] = await pool.query(
        Queries.getProductsByIds + 'AND pc.product_id IN (?)',
        [result]
      );

      // конечный возврат продуктов
      return res.status(200).json(rows3);
    } catch (error) {
      console.log(error);
    }
  }

  async createCategory(req, res) {
    try {
      const {
        parent_id,
        name,
        url,
        meta_title,
        meta_keywords,
        meta_description,
      } = req.body;

      if (!name.length || !url.length)
        return res.status(400).json('Category name or url mustnt be empty');

      const [checkUrl, fileds3] = await pool.query(
        'select id from category_lang where url = ?',
        [url]
      );
      if (checkUrl.length)
        return res
          .status(400)
          .json('Category with this url already was created');

      const [rows, filds] = await pool.query(Queries.createCategory, [
        parent_id || 0,
        1,
      ]);

      const create_data = [
        Number(rows.insertId),
        name,
        url,
        meta_title,
        meta_keywords,
        meta_description,
        1,
      ];

      const [rows2, filds2] = await pool.query(Queries.createCategoryLang, [
        create_data,
      ]);

      return res.status(200).json('Category was created');
    } catch (error) {
      console.log(error);
    }
  }

  async updateCategory(req, res) {
    try {
      console.log('dsds');
      const { name, url, meta_title, meta_keywords, meta_description } =
        req.body;

      const { id } = req.params;

      const [checkUrl, fileds3] = await pool.query(
        'select category_id from category_lang where url = ?',
        [url]
      );
      if (checkUrl.length && Number(checkUrl[0].category_id) !== Number(id)) {
        return res
          .status(400)
          .json('Category with this url already was created');
      }

      await pool.query(Queries.updateCategory, [
        name,
        url,
        meta_title,
        meta_keywords,
        meta_description,
        id,
      ]);
      return res.status(200).json('Category was updated');
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCategory(req, res) {
    try {
      const [rows, filds] = await pool.query(
        'SELECT * FROM category WHERE parent_id = ?',
        [req.params.id]
      );
      const [rows2, filds2] = await pool.query(
        'SELECT * FROM product_category WHERE category_id = ?',
        [req.params.id]
      );

      if (rows.length || rows2.length)
        return res
          .status(400)
          .json('This category contain subcategories or products');

      await pool.query('DELETE FROM category WHERE id=?;', [req.params.id]);
      await pool.query('DELETE FROM category_lang WHERE category_id=?;', [
        req.params.id,
      ]);

      return res.status(200).json('Category was deleted');
    } catch (error) {
      console.log(error);
    }
  }

  async getCategoryPhoto(req, res) {
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

  async getAllCategories(req, res) {
    try {
      const [rows, filds] = await pool.query(Queries.getAllCategories);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const [rows, filds] = await pool.query(Queries.getProductsByCategory, [
        req.params.url,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsFromOnePageByCategory(req, res) {
    try {
      const page = req.params.page;
      const qtyItemsPage = 8;
      const startingLimit = (page - 1) * qtyItemsPage;

      const [rows, filds] = await pool.query(Queries.getProductsByCategory, [
        req.params.url,
      ]);

      const numberOfResult = rows.length;
      const numberOfPages = Math.ceil(rows.length / qtyItemsPage);

      const [rows2, fields2] = await pool.query(
        Queries.getProductsFromOnePageByCategory,
        [req.params.url, startingLimit, qtyItemsPage]
      );
      return res.status(200).json({
        data: rows2,
        numberOfResult,
        numberOfPages,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getSubcategoryProductsByUrl(req, res) {
    try {
      const [rows, filds] = await pool.query(Queries.getProductsByCategory, [
        req.params.url,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltredProductsByManufacturerAndCategory(req, res) {
    try {
      const { url } = req.params;
      const { brands } = req.body;

      let q = Queries.getFiltredProductsByManufacturerAndCategory;

      if (brands && brands.length) {
        q += ` AND p.manufacturer_id IN(${brands.join(', ')})`;
      }
      const [rows, filds] = await pool.query(q, [url]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getManufacturersAndQtyOfProducts(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getManufacturersAndQtyOfProducts,
        [req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristicsCategoryByUrl(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getCharacteristicsCategory + `AND cl.url LIKE ?`,
        [req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristicsCategoryById(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getCharacteristicsCategory + `AND cl.category_id = ?`,
        [req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltrationParamsByCategory(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getFiltrationParamsByCategory,
        [req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getSubcategoriesByCategoryUrl(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getSubcategoriesByCategoryUrl,
        [req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltrationCharacteristictAndParams(req, res) {
    try {
      const [rows, filds] = await pool.query(
        Queries.getCharacteristicsCategory + `AND cl.url LIKE ?`,
        [req.params.url]
      );

      const [rows2, filds2] = await pool.query(
        Queries.getFiltrationParamsByCategory,
        [req.params.url]
      );

      const response_obj = {};

      rows2.forEach((el) => {
        if (response_obj.hasOwnProperty(el.property_id)) {
          const prop_status = response_obj[el.property_id].filter(
            (e) => e.property_value_id === el.property_value_id
          );
          if (!prop_status.length && el.name.length)
            response_obj[el.property_id].push({
              value: el.name,
              value_id: el.property_value_id,
            });
        } else {
          if (el.name.length > 0) {
            response_obj[el.property_id] = [
              { value: el.name, value_id: el.property_value_id },
            ];
          }
        }
      });
      return res.status(200).json({
        characteriscics: rows,
        values: response_obj,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new categoryController();
