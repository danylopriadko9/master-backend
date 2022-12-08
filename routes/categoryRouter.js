const categoryController = require('../controllers/categoryController.js');
const categoryRouter = require('express').Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get(
  '/subcategories/:url',
  categoryController.getSubcategoriesByCategoryUrl
);
categoryRouter.get(
  '/page/:url/:page',
  categoryController.getProductsFromOnePageByCategory
);
categoryRouter.post(
  '/manufacturer/:url',
  categoryController.getFiltredProductsByManufacturerAndCategory
);
categoryRouter.get(
  '/manufacturers/:url',
  categoryController.getManufacturersAndQtyOfProducts
);
categoryRouter.get(
  '/characteristics/:url',
  categoryController.getCharacteristicsCategoryByUrl
);

categoryRouter.get(
  '/characteristics/id/:id',
  categoryController.getCharacteristicsCategoryById
);

categoryRouter.get(
  '/characteristics-and-product-values/:url',
  categoryController.getFiltrationParamsByCategory
);

categoryRouter.get('/photo/:id', categoryController.getCategoryPhoto);

categoryRouter.get('/:url', categoryController.getProductsByCategory);

categoryRouter.get(
  '/filter/category/:url',
  categoryController.getFiltrationCharacteristictAndParams
);

module.exports = categoryRouter;
