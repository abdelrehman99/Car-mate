const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchasync');
const Products = require('./../models/ProductModel');
const AppError = require('../utils/apperror');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const multer = require('multer');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('Owns Purchased');

  res.status(200).json({
    message: 'success',
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate('Owns Purchased');
  res.status(201).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  const done = await User.deleteMany();
  res.status(200).json({
    status: 'success',
  });
});

exports.Favourite = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id);
  if (!product) return next(new AppError('This product does not exisit', 404));
  // req.user.Favorites = [];
  // console.log(product);
  const idx = req.user.Favorites.findIndex((el) => {
    console.log(el);
    return el._id.equals(product._id);
  });
  console.log(idx);
  if (idx == -1) req.user.Favorites.push(req.params.id), console.log('success');
  else req.user.Favorites.splice(idx, 1);
  const user = await User.findByIdAndUpdate(req.user._id, req.user, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    results: user,
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
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover) return next();

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
  req.user.Image = result.secure_url;
  next();
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Only owner can update product (dont use == or != becuase obejctId does not work with it)
  // console.log(product.Owner + '\n' + req.user._id);

  const product = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.help = catchAsync(async (req, res, next) => {
  if (!req.body.message)
    return next(new AppError('Please provide a message', 404));
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: req.body.message }],
  });
  console.log(completion.data.choices[0].message);
  res.status(200).json({
    status: 'success',
    message: completion.data.choices[0].message,
  });
});

exports.profile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: req.user,
  });
});
