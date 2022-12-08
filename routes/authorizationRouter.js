const authorizationRouter = require('express').Router();
const authorizationController = require('../controllers/authorizationController.js');

authorizationRouter.post('/login', authorizationController.login);
authorizationRouter.post('/logout', authorizationController.logout);
authorizationRouter.post('/register', authorizationController.register);

module.exports = authorizationRouter;
