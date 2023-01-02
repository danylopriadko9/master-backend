const pool = require('../db/config.js');
const fs = require('fs');
const date = require('date-and-time');

class imageUploadController {
  async uploadCategoryImage(req, res) {
    try {
      const file = req.file?.filename || req.body.file;

      const [categoryImage] = await pool.query(
        `SELECT id FROM category_image WHERE category_id = ?`,
        [req.params.id]
      );

      if (categoryImage.length) {
        await pool.query(
          `UPDATE category_image SET filename = ? WHERE category_id = ?`,
          [file, req.params.id]
        );
      }

      if (!categoryImage.length) {
        const now = new Date();
        const formatDate = date.format(now, 'YYYY-MM-DD HH:mm:ss');

        const data = [
          formatDate,
          formatDate,
          req.params.id,
          `static/category/${req.params.id}`,
          file,
          'main',
        ];
        await pool.query(
          `INSERT INTO category_image(t_created, t_updated, category_id, dir_path, filename, type) VALUES(?)`,
          [data]
        );

        return res.status(200).json('Success');
      }

      const filenames = fs.readdirSync(`static/category/${req.params.id}`);
      filenames.forEach((el) => {
        if (el !== file) {
          fs.unlinkSync(`static/category/${req.params.id}/${el}`);
        }
      });

      return res.status(200).json('Image was successfly changed');
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new imageUploadController();
