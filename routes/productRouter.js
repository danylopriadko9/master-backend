const productController = require('../controllers/productController.js');
const productRouter = require('express').Router();
const fileMiddleware = require('../middlewares/file.js');

productRouter.get('/discount', productController.getProductsWithDiscount);

productRouter.post('/relation/:id', productController.changeRelationProducts);
productRouter.post(
  '/characteristics/:id',
  productController.changeProductCharacteristics
);

productRouter.get('/new', productController.getNewProducts);

productRouter.get('/one/:url', productController.getOneProductByUrl);

productRouter.post('/', productController.getProductsByIds);

productRouter.get(
  '/characteristics/:id',
  productController.getProductCharacteristicsById
);
productRouter.get('/id/:id', productController.getProductById);

productRouter.get(
  '/properties/:id',
  productController.getProductsPropertiesProducts
);

productRouter.get(
  '/properties/id/:id',
  productController.getProductsPropertiesProductsId
);

productRouter.get('/photos/:id', productController.getAllProductPhotosById);
productRouter.get('/photo/:id', productController.getProductImage);
productRouter.post(
  `/photos-delete/:id`,
  productController.checkAndDeletePhotos
);
productRouter.post(
  `/photos-upload/:type/:id`,
  fileMiddleware.array('files'),
  productController.uploadPhotos
);

productRouter.get(
  '/compare/:id',
  productController.getCompareProductCharacteristicsValuesById
);

productRouter.post(
  '/property-compare-products',
  productController.getPropertiesCompareProducts
);

productRouter.get('/manufacturers', productController.getAllManufacturers);

productRouter.put('/:id', productController.updateProduct);
productRouter.post('/create', productController.createProduct);

module.exports = productRouter;
