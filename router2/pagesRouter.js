const pagesController = require('../controllers2/pagesController.js');
const pagesRouter = require('express').Router();

pagesRouter.post('/', pagesController.getInformationForMainPage);
pagesRouter.get('/product/:url', pagesController.getInformationForProductPage);
pagesRouter.get('/search', pagesController.getSearchProducts);
pagesRouter.get('/category', pagesController.getCategoryPageInformation);
pagesRouter.get(
  '/category-properties',
  pagesController.getCategoryPropucrsProperties
);
pagesRouter.post('/filter', pagesController.getFiltratedProducts);
pagesRouter.post('/compare', pagesController.getComparePageInformation);

module.exports = pagesRouter;
