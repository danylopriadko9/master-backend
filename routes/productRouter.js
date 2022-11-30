const {
  getProductsWithDiscount,
  getNewProducts,
  getOneProductByUrl,
  getProductsByIds,
  getProductCharacteristicsById,
  getProductsPropertiesProducts,
  getAllProductPhotosById,
  getProductImage,
  getCompareProductCharacteristicsValuesById,
  getPropertiesCompareProducts,
} = require('../controllers/productController.js');
const productRouter = require('express').Router();

productRouter.get('/discount', getProductsWithDiscount);

productRouter.get('/new', getNewProducts);

productRouter.get('/one/:url', getOneProductByUrl);

productRouter.post('/', getProductsByIds);

productRouter.get('/characteristics/:id', getProductCharacteristicsById);

productRouter.get('/properties/:id', getProductsPropertiesProducts);

productRouter.get('/photos/:id', getAllProductPhotosById);
productRouter.get('/photo/:id', getProductImage);

productRouter.get('/compare/:id', getCompareProductCharacteristicsValuesById);

productRouter.post('/property-compare-products', getPropertiesCompareProducts);

module.exports = productRouter;
