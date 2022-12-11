const usersController = require('../controllers/usersController.js');
const usersRouter = require('express').Router();

usersRouter.get('/', usersController.getAllUsers);
usersRouter.delete('/:id', usersController.deleteUser);
usersRouter.put('/:id', usersController.updateUser);

module.exports = usersRouter;
