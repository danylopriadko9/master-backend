const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const path = require('path');
const { readdir } = require('fs').promises;
const date = require('date-and-time');

class categoryController {
  async updateCategoryCharacteristics(req, res) {
    try {
      const { id } = req.params;
      const characteristics = req.body;

      const { language_id } = res.locals;

      const q = `
      SELECT pl.property_id, name FROM master.property_rel_category prc
      JOIN property_lang pl
        ON pl.property_id = prc.property_id
      WHERE status = "enabled"
      AND category_id = ?
      AND language_id = ?
      `;

      const [category_characteristics] = await pool.query(q, [id, language_id]);

      category_characteristics.forEach(async (el) => {
        const check = characteristics.filter(
          (e) => e.property_id === el.property_id
        );

        if (!check.length) {
          await pool.query(
            `
            DELETE prc 
            FROM property_rel_category prc 
              JOIN property_lang pl
              ON pl.property_id = prc.property_id
              WHERE prc.category_id = ? AND prc.property_id = ? AND pl.language_id = ?;
            `,
            [id, el.property_id, language_id]
          );
          return;
        }
      });

      characteristics.forEach(async (el) => {
        if (!el.property_id) {
          const now = new Date();
          const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

          const [newproperty] = await pool.query(
            `INSERT INTO property (t_created, t_updated) VALUES (?, ?)`,
            [formatDate, formatDate]
          );
          const { insertId } = newproperty;

          const data = [insertId, language_id, el.characteristic];
          const data2 = [insertId, id, 'enabled'];

          await pool.query(
            `INSERT INTO property_lang(property_id, language_id, name) VALUES(?)`,
            [data]
          );
          await pool.query(
            `INSERT INTO property_rel_category (property_id, category_id, status) VALUES(?)`,
            [data2]
          );

          return;
        }

        const check = category_characteristics.filter(
          (e) => e.property_id === el.property_id
        );

        if (check[0].name !== el.characteristic) {
          await pool.query(
            `UPDATE property_lang SET name = ? WHERE property_id = ? AND language_id = ?`,
            [el.characteristic, el.property_id, language_id]
          );
        }
      });

      return res.status(200).json('Success');
    } catch (error) {
      console.log(error);
    }
  }

  async filtration(req, res) {
    try {
      const params = req.body.params;

      const keys = Object.keys(params);
      const values = Object.values(params);

      const { language_id } = res.locals;

      // если нету продуктов подходящих по цене и производителю возващаем пустой обьект
      if (!res.locals.filtred_ids.length) {
        return res.status(200).json([]);
      }

      // проверна на наличие параметров фильтрации и возват отфильтрованных по цене и производителю товаров
      if (!keys.length && res.locals.filtred_ids.length) {
        const [rows3, fields3] = await pool.query(
          Queries.getProductsByIds + `AND pc.product_id IN(?)`,
          [language_id, language_id, res.locals.filtred_ids]
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
      JOIN product_lang pl
        ON pl.product_id = p.id
      AND cl.url = ? -- достаем url из запроса
      AND prpv.status = 'enabled'
      AND property_id = ? -- эти значение будут меняться
      AND property_value_id = ? --
      AND p.id IN (?)
      AND pl.language_id = ?
      `;

      let result = [];

      const promises = keys.map(async (el, i) => {
        const [rows, filds] = await pool.query(q, [
          req.params.url,
          el,
          values[i],
          res.locals.filtred_ids,
          language_id,
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
      const [rows3] = await pool.query(
        Queries.getProductsByIds + 'AND pc.product_id IN (?)',
        [language_id, language_id, result]
      );

      // конечный возврат продуктов
      return res.status(200).json(rows3);
    } catch (error) {
      console.log(error);
    }
  }

  async createCategory(req, res) {
    try {
      const { language_id } = res.locals;

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
        language_id,
      ];

      const [rows2] = await pool.query(Queries.createCategoryLang, [
        create_data,
      ]);

      return res.status(200).json(rows.insertId);
    } catch (error) {
      console.log(error);
    }
  }

  async updateCategory(req, res) {
    try {
      const { name, url, meta_title, meta_keywords, meta_description } =
        req.body;

      const { id } = req.params;
      const { language_id } = res.locals;

      const [checkUrl, fileds3] = await pool.query(
        'select cl.category_id from category_lang cl where cl.url = ?',
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
        language_id,
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
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getAllCategories, [
        language_id,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getProductsByCategory, [
        language_id,
        language_id,
        req.params.url,
      ]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductsFromOnePageByCategory(req, res) {
    try {
      const { language_id } = res.locals;

      const page = req.params.page;
      const qtyItemsPage = 8;
      const startingLimit = (page - 1) * qtyItemsPage;

      const [rows, filds] = await pool.query(Queries.getProductsByCategory, [
        language_id,
        language_id,
        req.params.url,
      ]);

      const numberOfResult = rows.length;
      const numberOfPages = Math.ceil(rows.length / qtyItemsPage);

      const [rows2, fields2] = await pool.query(
        Queries.getProductsFromOnePageByCategory,
        [language_id, language_id, req.params.url, startingLimit, qtyItemsPage]
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
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(Queries.getProductsByCategory, [
        language_id,
        language_id,
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

      const { language_id } = res.locals;

      let q = Queries.getFiltredProductsByManufacturerAndCategory;

      if (brands && brands.length) {
        q += ` AND p.manufacturer_id IN(${brands.join(', ')})`;
      }
      const [rows, filds] = await pool.query(q, [url, language_id]);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getManufacturersAndQtyOfProducts(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getManufacturersAndQtyOfProducts,
        [language_id, language_id, language_id, req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristicsCategoryByUrl(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getCharacteristicsCategoryByUrl,
        [language_id, language_id, req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getCharacteristicsCategoryById(req, res) {
    try {
      const { language_id } = res.locals;
      const [rows, filds] = await pool.query(
        Queries.getCharacteristicsCategory + `AND category_id = ?`,
        [language_id, req.params.id]
      );

      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltrationParamsByCategory(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getFiltrationParamsByCategory,
        [req.params.url, language_id, language_id, language_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getSubcategoriesByCategoryUrl(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getSubcategoriesByCategoryUrl,
        [language_id, req.params.url]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }

  async getFiltrationCharacteristictAndParams(req, res) {
    try {
      const { language_id } = res.locals;

      const [rows, filds] = await pool.query(
        Queries.getCharacteristicsCategoryByUrl,
        [language_id, language_id, req.params.url]
      );

      const [rows2, filds2] = await pool.query(
        Queries.getFiltrationParamsByCategory,
        [req.params.url, language_id, language_id, language_id]
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
