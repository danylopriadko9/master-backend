const categoryController = require('../controllers/categoryController.js');
const { accessCheck } = require('../middlewares/accessCheck.js');
const currencyFiltration = require('../middlewares/currencyFiltration.js');
const categoryRouter = require('express').Router();
const fileMiddleware = require('../middlewares/file');

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
  '/characteristics/:id',
  categoryController.updateCategoryCharacteristics
);

categoryRouter.post(
  '/test/:url',
  currencyFiltration,
  categoryController.filtration
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

categoryRouter.get(
  '/:url',

  categoryController.getProductsByCategory
);

categoryRouter.get(
  '/filter/category/:url',
  categoryController.getFiltrationCharacteristictAndParams
);

categoryRouter.post(
  '/create',
  accessCheck,

  categoryController.createCategory
);
categoryRouter.put('/:id', accessCheck, categoryController.updateCategory);
categoryRouter.delete(
  '/:id',
  accessCheck,

  categoryController.deleteCategory
);

module.exports = categoryRouter;
