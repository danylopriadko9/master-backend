const authorizationRouter = require('express').Router();
const {
  login,
  logout,
  register,
} = require('../controllers/authorizationController.js');

authorizationRouter.post('/login', login);
authorizationRouter.post('/logout', logout);
authorizationRouter.post('/register', register);

module.exports = authorizationRouter;
