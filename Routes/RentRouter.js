const express = require('express');
const router = express.Router();
const rentController = require('./../Controllers/rentController');
const authController = require('./../Controllers/authcontroller');

// selling a product
router.post('/addRent', authController.ProtectRoutes, rentController.addRent);

// searching
router.post('/search', rentController.search);

// image
// router.get('/public/img/Products/:name', rentController.getImage);

router.post('/rent', authController.ProtectRoutes, rentController.rent);

router
  .route('/:id')
  .get(rentController.getProduct)
  .patch(
    authController.ProtectRoutes,
    rentController.uploadProdcutImage,
    rentController.resizeProductImages,
    rentController.updateProduct
  )
  .post(authController.ProtectRoutes, rentController.addReview);

router
  .route('/')
  .get(rentController.getAllRents)
  .delete(
    authController.ProtectRoutes,
    authController.restrictTo('admin'),
    rentController.deleteAll
  );

module.exports = router;
