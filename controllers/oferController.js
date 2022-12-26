const pool = require('../db/config.js');
const { Queries } = require('../db/queries.js');
const date = require('date-and-time');

class oferController {
  createOfer(req, res) {
    try {
      return res.status(200).json(req.body);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new oferController();
