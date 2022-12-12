const pool = require('../db/config.js');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

//delete file
//await unlinkAsync(req.file.path)

class imageUploadController {
  async uploadCategoryImage(req, res) {
    try {
      // INSERT INTO product_image (product_id, dir_path, filename)
      // VALUES (?);

      const file = req.file?.filename || req.body.file;

      console.log(req.body);

      await pool.query(
        `UPDATE category_image SET filename = ? WHERE category_id = ?`,
        [file, req.params.id]
      );

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
