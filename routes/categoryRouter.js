const {
  getAllCategories,
  getProductsByCaregory,
  getProductsFromOnePageByCategory,
  getFiltredProductsByManufacturerAndCategory,
  getManufacturersAndQtyOfProducts,
  getCharacteristicsCategory,
  getFiltrationParamsByCategory,
  getSubcategoriesByCategoryUrl,
  getFiltrationCharacteristictAndParams,
  getCategoryPhoto,
} = require('../controllers/categoryController.js');
const categoryRouter = require('express').Router();

categoryRouter.get('/', getAllCategories);
categoryRouter.get('/subcategories/:url', getSubcategoriesByCategoryUrl);
categoryRouter.get('/page/:url/:page', getProductsFromOnePageByCategory);
categoryRouter.post(
  '/manufacturer/:url',
  getFiltredProductsByManufacturerAndCategory
);
categoryRouter.get('/manufacturers/:url', getManufacturersAndQtyOfProducts);
categoryRouter.get('/characteristics/:url', getCharacteristicsCategory);
categoryRouter.get(
  '/characteristics-and-product-values/:url',
  getFiltrationParamsByCategory
);

categoryRouter.get('/photo/:id', getCategoryPhoto);

categoryRouter.get('/:url', getProductsByCaregory);

categoryRouter.get(
  '/filter/category/:url',
  getFiltrationCharacteristictAndParams
);

module.exports = categoryRouter;
