const {
  getSearchProductsByValues,
} = require('../controllers/searchController.js');
const searchRouter = require('express').Router();

searchRouter.use('/:groupUrl?/:searchValue/:page', getSearchProductsByValues);

module.exports = searchRouter;
