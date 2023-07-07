const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');
const apiFeatures = require('./../utils/apiFeatures');

exports.search = (Model, pop) =>
  catchAsync(async (req, res, next) => {
    // con
    const features = new apiFeatures(
      Model.find({ Name: { $regex: req.body.name.toLowerCase() } }).populate(
        pop
      ),
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

exports.get = (Model, pop) =>
  catchAsync(async (req, res, next) => {
    const product = await Model.findById(req.params.id).populate(pop).populate({
      path: 'Ratings',
      model: Model,
      populate: {
        path: 'user',
        model: 'User',
      },
    });

    // product.populate()
    if (!product) {
      return next(new AppError('There is no product with this id', 404));
    }

    res.status(201).json({
      status: 'success',
      data: product,
    });
  });

exports.deleteAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const product = await Model.deleteMany({ imageCover: null });

    res.status(200).json({
      status: 'success',
      data: product,
    });
  });
