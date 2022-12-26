const historyController = require('../controllers/historyController.js');
const historyRouter = require('express').Router();

historyRouter.get(
  '/product/:url',

  historyController.getHistoryByProductUrl
);

historyRouter.get(
  '/parent/product/:url',

  historyController.getHistoryProductInParentGroupByUrls
);

historyRouter.get(
  '/group/:url',

  historyController.getHistoryByGroupUrl
);

module.exports = historyRouter;
