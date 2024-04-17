const express = require('express');
const Router = express.Router();
const UserController = require('../controllers/user');

Router.post('/register', UserController.RegisterUser)
Router.post('/login', UserController.LoginUser);
Router.get('/', UserController.GetUser);

module.exports = Router;