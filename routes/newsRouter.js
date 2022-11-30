const {
  getAllNews,
  getOneNewById,
} = require('../controllers/newsController.js');
const newsRouter = require('express').Router();

newsRouter.get('/', getAllNews);
newsRouter.get('/:id', getOneNewById);

module.exports = newsRouter;
