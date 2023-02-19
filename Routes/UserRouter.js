const express = require('express');
const authController = require('../Controllers/authcontroller');
const userController = require('./../Controllers/usercontroller');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
  .route('/')
  .get(userController.getAllUsers)
  .delete(userController.deleteAll);

module.exports = router;
