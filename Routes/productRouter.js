const express = require('express');
const router = express.Router();
const prodcutController = require('./../Controllers/productController');
const authController = require('./../Controllers/authcontroller');

// selling a product
router.post('/add', authController.ProtectRoutes, prodcutController.addProduct);

// searching
router.post('/search', prodcutController.search);

// image
// router.get('/public/img/Products/:name', prodcutController.getImage);

router.post('/buy', authController.ProtectRoutes, prodcutController.buy);
router.patch(
  '/addImage/:id',
  authController.ProtectRoutes,
  prodcutController.uploadProdcutImage,
  prodcutController.resizeProductImages,
  prodcutController.updateProduct
);

router
  .route('/:id')
  .get(prodcutController.getProduct)
  .patch(authController.ProtectRoutes, prodcutController.updateProduct)
  .post(authController.ProtectRoutes, prodcutController.addReview);

router
  .route('/')
  .get(prodcutController.getAllProducts)
  .delete(
    authController.ProtectRoutes,
    authController.restrictTo('admin'),
    prodcutController.deleteAll
  );

module.exports = router;
