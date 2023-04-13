class apiFeatures {
  constructor(Query, queryString) {
    this.Query = Query;
    this.queryString = queryString;
  }

  filter() {
    // derefrence obejct
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // remove non filtered parameters
    excludedFields.forEach((el) => delete queryObj[el]);

    // adding $ sign before mongoose operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.Query = this.Query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.Query = this.Query.sort(sortBy);
    } else {
      this.Query = this.Query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.Query = this.Query.select(fields);
    } else {
      this.Query = this.Query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.Query = this.Query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = apiFeatures;
