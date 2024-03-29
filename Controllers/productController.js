const multer = require('multer');
const products = require('./../models/ProductModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');
const apiFeatures = require('./../utils/apiFeatures');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const User = require('./../models/UserModel');
const Cart = require('./../models/CartModel');
const rents = require('./../models/RentModel');
const Factory = require('./Factory');

exports.search = Factory.search(products);
exports.getProduct = Factory.get(products);
exports.deleteAll = Factory.deleteAll(products);

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(
    products
      .find({ Name: { $ne: 'test' }, Quantity: { $gt: 0 } })
      .populate('Buyers Owner'),
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

exports.addProduct = catchAsync(async (req, res, next) => {
  const newProduct = await products.create({
    Name: req.body.Name.toLowerCase(),
    Condition: req.body.Condition,
    Description: req.body.Description,
    Price: req.body.Price,
    Quantity: req.body.Quantity,
    Location: req.body.Location,
    Owner: req.user._id,
    Type: req.body.Type,
    createdAt: new Date(),
  });
  // console.log(req.user);
  req.user.Owns.push(newProduct._id);
  newUser = await User.findByIdAndUpdate(req.user._id, req.user, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    message: newProduct,
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log(file);
  if (
    file.mimetype.startsWith('image') ||
    file.mimetype.startsWith('application/octet-stream')
  ) {
    cb(null, true);
  } else {
    // console.error('ERROR');
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
  console.log('YES');
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
  console.log(result);
  req.body.imageCover = result.secure_url;

  req.body.Images = [];

  await Promise.all(
    req.files.Images.map(async (file) => {
      result = await uploadFromBuffer(file.buffer);
      console.log(result.secure_url);
      req.body.Images.push(result.secure_url);
    })
  );

  next();
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // Only owner can update product (dont use == or != becuase obejctId does not work with it)
  // console.log(product.Owner + '\n' + req.user._id);
  // console.log(req.body);
  if (!req.user.Owns.includes(req.params.id))
    return next(
      new AppError('You are not allowed to update this product.', 401)
    );

  if (req.body.Name) req.body.Name = req.body.Name.toLowerCase();
  const product = await products.findByIdAndUpdate(req.params.id, req.body, {
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

exports.buy = catchAsync(async (req, res, next) => {
  let items = [],
    Products = [],
    Quantity = [];
  await Promise.all(
    req.body.products.map(async (product) => {
      const my_product = await products.findById(product.id);

      if (!my_product) {
        return next(new AppError(`No product found with that ID`, 404));
      }

      if (my_product.Owner.equals(req.user._id))
        return next(
          new AppError(
            `You cannot buy your own product ${my_product.Name}`,
            401
          )
        );

      if (product.Quantity > my_product.Quantity)
        return next(
          new AppError(
            `There is only ${my_product.Quantity} number of ${my_product.Name}, please provide a suitable amount.`,
            404
          )
        );

      if (!req.body.success_url || !req.body.cancel_url || !product.Quantity)
        return next(
          new AppError(
            'Please provide a success_url, cancel_url, and a Qunatity',
            401
          )
        );

      const stripe_product = await stripe.products.create({
        name: my_product.Name,
        images: [my_product.imageCover],
        description: my_product.Description,
      });

      const price = await stripe.prices.create({
        currency: 'usd',
        product: stripe_product.id,
        unit_amount: my_product.Price * 100,
      });

      Products.push(product.id);
      Quantity.push(product.Quantity);

      items.push({
        price: price.id,
        quantity: product.Quantity,
      });
    })
  );

  const cart = await Cart.create({
    Products: Products,
    Quantity: Quantity,
    User: req.user._id,
  });

  const session = await stripe.checkout.sessions.create({
    success_url: req.body.success_url,
    cancel_url: req.body.cancel_url,
    mode: 'payment',
    client_reference_id: String(cart._id),
    customer_email: req.user.email,
    line_items: items,
  });

  // console.log(session.id);

  res.status(201).json({
    message: 'success',
    url: session.url,
  });
});

const reference = catchAsync(async (session) => {
  // update User

  // console.log(session.id);

  let user = await User.findOne({ email: session.customer_email });
  const cart = await Cart.findById(session.client_reference_id);
  let mp = [];

  if (cart) {
    cart.Products.map((product) => {
      user.Purchased.push(product);
    });

    // await Promise.all(
    //   Object.keys(mp).map(async (id) => {
    //     let owner = await User.findById(id);
    //     owner.Balance += mp[id];
    //     await owner.save();
    //   })
    // );

    await User.findByIdAndUpdate(user._id, user, {
      new: true,
      runValidators: true,
    });

    for (let i = 0; i < cart.Products.length; i++) {
      // Update Product
      let product = await products.findById(cart.Products[i]);
      product.Buyers.push(user._id);
      const quantity = cart.Quantity[i];
      product.Sold += quantity;
      product.Quantity -= quantity;

      // await product.save();
      await products.findByIdAndUpdate(product._id, product, {
        new: true,
        runValidators: true,
      });
    }
    return;
  }

  let car = await rents.findById(session.client_reference_id);

  user.Rented.push(car._id);

  await User.findByIdAndUpdate(user._id, user, {
    new: true,
    runValidators: true,
  });

  // Update car
  car.Renters.push(user._id);
  const days = session.amount_total / (car.Price * 100);
  car.Available = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  car.Rented += days;

  await car.save();
  // await cars.findByIdAndUpdate(car._id, car, {
  //   new: true,
  //   runValidators: true,
  // });
  // await car.save();
  await rents.findByIdAndUpdate(car._id, car, {
    new: true,
    runValidators: true,
  });
});

exports.webhook = (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEB_HOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  // console.log(event);

  if (event.type == 'checkout.session.completed') reference(event.data.object);

  // Return a 200 res to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

exports.addReview = catchAsync(async (req, res, next) => {
  if (!req.user.Purchased.includes(req.params.id))
    return next(new AppError('You must buy the product to add a review.', 401));

  // console.log(req.user.Purchased);
  let product = await products.findById(req.params.id);

  if (!product) return next(new AppError('This product does not exist', 401));

  if (product.Ratings[0] == 0) product.Ratings.shift();

  product.Ratings.push({
    user: req.user._id,
    Rating: req.body.Rating,
    Description: req.body.Description,
  });
  // req.body.user = ;
  console.log(product);
  product.RatingsSum += req.body.Rating;

  await product.save();

  res.status(201).json({
    message: 'success',
    data: product,
  });
});
