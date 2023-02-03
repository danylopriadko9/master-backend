const router2 = require('express').Router();
const pagesRouter = require('./pagesRouter.js');
const productsRouter = require('./productsRouter.js');

router2.use('/page', pagesRouter);
router2.use('/products', productsRouter);

module.exports = router2;
