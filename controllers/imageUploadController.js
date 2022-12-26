const pool = require('../db/config.js');
const fs = require('fs');

class imageUploadController {
  async uploadCategoryImage(req, res) {
    try {
      const file = req.file?.filename || req.body.file;
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
