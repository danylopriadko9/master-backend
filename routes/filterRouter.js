const filterRouter = require('express').Router();
const filtrationController = require('../controllers/filtrationController.js');

filterRouter.post('/post/:url', filtrationController.parseParams);

module.exports = filterRouter;
