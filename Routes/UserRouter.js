const express = require('express');
const authController = require('../Controllers/authcontroller');
const usercontroller = require('./../Controllers/usercontroller');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.route('/').get(authController.ProtectRoutes, usercontroller.getAllUsers);

module.exports = router;
