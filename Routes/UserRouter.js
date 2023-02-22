const express = require('express');
const authController = require('../Controllers/authcontroller');
const userController = require('./../Controllers/usercontroller');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .delete(
    authController.ProtectRoutes,
    authController.restrictTo('admin'),
    userController.deleteAll
  );

module.exports = router;
