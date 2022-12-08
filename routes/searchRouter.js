const searchController = require('../controllers/searchController.js');
const searchRouter = require('express').Router();

searchRouter.use(
  '/:groupUrl?/:searchValue/:page',
  searchController.getSearchProductsByValues
);

module.exports = searchRouter;
