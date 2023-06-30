const express = require('express');
const authController = require('../Controllers/authcontroller');
const userController = require('./../Controllers/usercontroller');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/help', userController.help);
router.post(
  '/changePassword',
  authController.ProtectRoutes,
  authController.changePassword
);
router.patch('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/profile', authController.ProtectRoutes, userController.profile);
router.get('/:id', userController.getUser);
router.patch(
  '/Favourite/:id',
  authController.ProtectRoutes,
  userController.Favourite
);

router.patch(
  '/addImage',
  authController.ProtectRoutes,
  userController.uploadProdcutImage,
  userController.resizeProductImages,
  userController.updateUser
);

router
  .route('/')
  .get(userController.getAllUsers)
  .delete(
    authController.ProtectRoutes,
    authController.restrictTo('admin'),
    userController.deleteAll
  )
  .patch(authController.ProtectRoutes, userController.updateUser);

module.exports = router;
// Test git
