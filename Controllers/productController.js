const multer = require('multer');
const sharp = require('sharp');
const products = require('./../models/ProductModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');
const apiFeatures = require('./../utils/apiFeatures');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { raw } = require('express');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(products.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const product = await features.Query;

  res.status(201).json({
    status: 'success',
    results: product.length,
    product,
  });
});

exports.getImage = catchAsync(async (req, res, next) => {
  const path = req.url;
  console.log(path);

  // if (!fs.existsSync(path)) {
  //   return next(new AppError('This image does not exist', 404));
  // }

  res.status(201).sendFile(path);
});

exports.search = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(
    products.find({ Name: { $regex: req.body.name } }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const product = await features.Query;

  res.status(201).json({
    status: 'success',
    results: product.length,
    product,
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
    Condition: req.body.Condition,
    Description: req.body.Description,
    Price: req.body.Price,
    Quantity: req.body.Quantity,
    Location: req.body.Location,
    Owner: req.user._id,
    Type: req.body.Type,
    createdAt: new Date(),
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
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.Images) return next();

  let uploadFromBuffer = (file) => {
    return new Promise((resolve, reject) => {
      let cld_upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: 'foo',
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(file).pipe(cld_upload_stream);
    });
  };

  let result = await uploadFromBuffer(req.files.imageCover[0].buffer);
  req.body.imageCover = result.secure_url;

  req.body.Images = [];

  await Promise.all(
    req.files.Images.map(async (file) => {
      result = await uploadFromBuffer(file.buffer);
      console.log(result.secure_url);
      req.body.Images.push(result.secure_url);
    })
  );
  // console.log(result.secure_url);
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

exports.deleteAll = catchAsync(async (req, res, next) => {
  const product = await products.deleteMany();

  res.status(200).json({
    status: 'success',
    data: product,
  });
});
