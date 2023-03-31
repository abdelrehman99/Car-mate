const multer = require('multer');
const sharp = require('sharp');
const products = require('./../models/ProductModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const product = await products.find();
  res.status(201).json({
    status: 'success',
    results: product.length,
    data: {
      product,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await products.findById(req.params.id);

  if (!product) {
    return next(new AppError('There is no product with this id', 404));
  }

  res.status(201).json({
    status: 'success',
    data: product,
  });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  const newProduct = await products.create({
    Name: req.body.Name,
    Summary: req.body.Summary,
    Description: req.body.Description,
    Price: req.body.Price,
    Quantity: req.body.Quantity,
    Location: req.body.Location,
    Owner: req.user._id,
    imageCover: req.body.imageCover,
    Images: req.body.Images,
  });

  res.status(201).json({
    status: 'success',
    message: newProduct,
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProdcutImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'Images', maxCount: 5 },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.Images) return next();

  console.log('Done');
  // 1) Cover image
  req.body.imageCover = `Products-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/Products/${req.body.imageCover}`);

  // 2) Images
  req.body.Images = [];

  await Promise.all(
    req.files.Images.map(async (file, i) => {
      const filename = `Products-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/Products/${filename}`);

      req.body.Images.push(filename);
    })
  );

  next();
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await products.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  console.log(product.Owner + '\n' + req.user._id);
  // Only owner can update product (dont use == or != becuase obejctId does not work with it)
  if (!product.Owner.equals(req.user._id)) {
    return next(
      new AppError('You are not allowed to update this product.', 401)
    );
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});
