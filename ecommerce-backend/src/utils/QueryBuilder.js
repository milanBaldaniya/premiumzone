/**
 * Reusable Mongoose query builder providing pagination, sorting, field
 * selection, filtering and global search from Express query params.
 *
 * Usage:
 *   const qb = new QueryBuilder(Product.find(), req.query)
 *     .search(['name', 'sku'])
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const [data, total] = await Promise.all([qb.exec(), qb.count()]);
 */
export class QueryBuilder {
  constructor(mongooseQuery, queryString = {}) {
    this.query = mongooseQuery;
    this.queryString = queryString;
    this.filterConditions = {};
    this.page = Math.max(1, parseInt(queryString.page, 10) || 1);
    this.limit = Math.min(100, Math.max(1, parseInt(queryString.limit, 10) || 12));
  }

  search(fields = []) {
    const term = this.queryString.search?.trim();
    if (term && fields.length) {
      const regex = { $regex: term, $options: 'i' };
      this.filterConditions.$or = fields.map((f) => ({ [f]: regex }));
    }
    return this;
  }

  filter() {
    const excluded = ['page', 'sort', 'limit', 'fields', 'search'];
    const raw = { ...this.queryString };
    excluded.forEach((k) => delete raw[k]);

    // Support advanced operators: price[gte]=100 -> { price: { $gte: 100 } }
    let str = JSON.stringify(raw);
    str = str.replace(/\b(gte|gt|lte|lt|in|ne|eq)\b/g, (m) => `$${m}`);
    const parsed = JSON.parse(str);

    // Coerce comma-separated $in values into arrays
    Object.values(parsed).forEach((val) => {
      if (val && typeof val === 'object' && typeof val.$in === 'string') {
        val.$in = val.$in.split(',');
      }
    });

    this.filterConditions = { ...this.filterConditions, ...parsed };
    this.query = this.query.find(this.filterConditions);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(',').join(' '));
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    this.query = this.query.skip((this.page - 1) * this.limit).limit(this.limit);
    return this;
  }

  exec() {
    return this.query;
  }

  async count() {
    return this.query.model.countDocuments(this.filterConditions);
  }

  get pagination() {
    return { page: this.page, limit: this.limit };
  }
}
