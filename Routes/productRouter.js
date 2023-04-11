const express = require('express');
const router = express.Router();
const prodcutController = require('./../Controllers/productController');
const authController = require('./../Controllers/authcontroller');

// selling a product
router.post('/add', authController.ProtectRoutes, prodcutController.addProduct);

router
  .route('/:id')
  .get(prodcutController.getProduct)
  .patch(
    authController.ProtectRoutes,
    prodcutController.uploadProdcutImage,
    prodcutController.resizeProductImages,
    prodcutController.updateProduct
  );

router
  .route('/')
  .get(prodcutController.getAllProducts)
  .delete(
    authController.ProtectRoutes,
    authController.restrictTo('admin'),
    prodcutController.deleteAll
  );

module.exports = router;
