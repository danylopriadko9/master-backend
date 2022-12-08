const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const path = require('path');
const { readdir } = require('fs').promises;
const db = require('../db.js');

class categoryController {
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
    // try {
    //   pool.getConnection((err, connection) => {
    //     connection.query(Queries.getAllCategories, (err, data) => {
    //       if (err) throw err;
    //       else return res.status(200).json(data);
    //     });

    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const url = req.params.url;

    //   pool.getConnection((error, connection) => {
    //     connection.query(Queries.getProductsByCategory, [url], (err, data) => {
    //       if (err) throw err;
    //       return res.status(200).json(data);
    //     });
    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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

    // try {
    //   const page = req.params.page;
    //   const qtyItemsPage = 8;
    //   const startingLimit = (page - 1) * qtyItemsPage;

    //   pool.getConnection((error, connection) => {
    //     connection.query(
    //       Queries.getProductsByCategory,
    //       [req.params.url],
    //       (err, data) => {
    //         if (err) throw err;
    //         const numberOfResult = data.length;
    //         const numberOfPages = Math.ceil(data.length / qtyItemsPage);

    //         connection.query(
    //           Queries.getProductsFromOnePageByCategory,
    //           [req.params.url, startingLimit, qtyItemsPage],
    //           (err, data) => {
    //             if (err) throw err;
    //             return res.status(200).json({
    //               data,
    //               numberOfResult,
    //               numberOfPages,
    //             });
    //           }
    //         );
    //       }
    //     );
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const { url } = req.params;
    //   pool.getConnection((error, connection) => {
    //     connection.query(Queries.getProductsByCategory, [url], (err, data) => {
    //       if (err) throw err;
    //       else return res.status(200).json(data);
    //     });

    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const { url } = req.params;
    //   const { brands } = req.body;

    //   let q = Queries.getFiltredProductsByManufacturerAndCategory;

    //   if (brands && brands.length) {
    //     q += ` AND p.manufacturer_id IN(${brands.join(', ')})`;
    //   }

    //   pool.getConnection((error, connection) => {
    //     connection.query(q, [url], (err, data) => {
    //       if (err) throw err;
    //       else return res.status(200).json(data);
    //     });

    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const url = req.params.url;
    //   pool.getConnection((error, connection) => {
    //     connection.query(
    //       Queries.getManufacturersAndQtyOfProducts,
    //       [url],
    //       (err, data) => {
    //         if (err) throw err;
    //         else return res.status(200).json(data);
    //       }
    //     );
    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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

    // try {
    //   const { url } = req.params;

    //   pool.getConnection((error, connection) => {
    //     const q = Queries.getCharacteristicsCategory + `AND cl.url LIKE ?`;
    //     connection.query(q, [url], (err, data) => {
    //       if (err) throw err;
    //       else return res.status(200).json(data);
    //     });
    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const { id } = req.params;

    //   pool.getConnection((error, connection) => {
    //     const q = Queries.getCharacteristicsCategory + `AND cl.category_id = ?`;
    //     connection.query(q, [id], (err, data) => {
    //       if (err) throw err;
    //       else return res.status(200).json(data);
    //     });
    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const { url } = req.params;

    //   pool.getConnection((error, connection) => {
    //     connection.query(
    //       Queries.getFiltrationParamsByCategory,
    //       [url],
    //       (err, data) => {
    //         if (err) throw err;
    //         else return res.status(200).json(data);
    //       }
    //     );
    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
    // try {
    //   const { url } = req.params;

    //   pool.getConnection((error, connection) => {
    //     connection.query(
    //       Queries.getSubcategoriesByCategoryUrl,
    //       [url],
    //       (err, data) => {
    //         if (err) throw err;

    //         return res.status(200).json(data);
    //       }
    //     );

    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
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
          const prop_status = response_obj[el.property_id].includes(el.name);
          if (!prop_status && el.name.length)
            response_obj[el.property_id].push(el.name);
        } else {
          if (el.name.length > 0) {
            response_obj[el.property_id] = [el.name];
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
    // try {
    //   pool.getConnection((error, connection) => {
    //     const q = Queries.getCharacteristicsCategory + `AND cl.url LIKE ?`;
    //     connection.query(q, [req.params.url], (err, data) => {
    //       if (err) throw err;

    //       connection.query(
    //         Queries.getFiltrationParamsByCategory,
    //         [req.params.url],
    //         (err, secoundData) => {
    //           if (err) throw err;

    //           const response_obj = {};
    //           secoundData.forEach((el) => {
    //             if (response_obj.hasOwnProperty(el.property_id)) {
    //               const prop_status = response_obj[el.property_id].includes(
    //                 el.name
    //               );
    //               if (!prop_status && el.name.length)
    //                 response_obj[el.property_id].push(el.name);
    //             } else {
    //               if (el.name.length > 0) {
    //                 response_obj[el.property_id] = [el.name];
    //               }
    //             }
    //           });

    //           return res.json({
    //             characteriscics: data,
    //             values: response_obj,
    //           });
    //         }
    //       );
    //     });
    //     connection.release();
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
  }
}

module.exports = new categoryController();
