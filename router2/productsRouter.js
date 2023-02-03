const productsController = require('../controllers2/productsController.js');
const productsRouter = require('express').Router();

productsRouter.post('/', productsController.getProductsByIds);

module.exports = productsRouter;
