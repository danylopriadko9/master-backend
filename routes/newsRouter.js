const newsController = require('../controllers/newsController.js');
const newsRouter = require('express').Router();

newsRouter.get('/', newsController.getAllNews);
newsRouter.get('/:id', newsController.getOneNewById);

module.exports = newsRouter;
