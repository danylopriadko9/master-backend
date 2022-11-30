const filterRouter = require('express').Router();
const { parseParams } = require('../controllers/filtrationController.js');

filterRouter.post('/post/:url', parseParams);

module.exports = filterRouter;
