const {
  getHistoryProductInParentGroupByUrls,
  getHistoryByProductUrl,
  getHistoryByGroupUrl,
} = require('../controllers/historyController.js');
const historyRouter = require('express').Router();

historyRouter.get('/product/:url', getHistoryByProductUrl);

historyRouter.get('/parent/product/:url', getHistoryProductInParentGroupByUrls);

historyRouter.get('/group/:url', getHistoryByGroupUrl);

module.exports = historyRouter;
