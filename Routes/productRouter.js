const express = require('express');
const router = express.Router();
const prodcutController = require('./../Controllers/productController');
const authController = require('./../Controllers/authcontroller');

// selling a product
router.post('/add', authController.ProtectRoutes, prodcutController.addProduct);

// searching
router.get('/search', prodcutController.search);

// image
// router.get('/public/img/Products/:name', prodcutController.getImage);

router.post('/buy/:id', authController.ProtectRoutes, prodcutController.buy);


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
