const express = require('express');
const router = express.Router();
const prodcutController = require('./../Controllers/productController');
const authController = require('./../Controllers/authcontroller');

// selling a product
router.post('/add', authController.ProtectRoutes, prodcutController.addProduct);

router
  .route('/:id')
  .patch(
    authController.ProtectRoutes,
    prodcutController.uploadProdcutImage,
    prodcutController.resizeProductImages,
    prodcutController.updateProduct
  );

router.route('/').get(prodcutController.getAllProducts);

module.exports = router;
