import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

/**
 * Generates standard CRUD handlers for a Mongoose model. Resource-specific
 * controllers can spread these and override individual handlers as needed.
 *
 * @param {import('mongoose').Model} Model
 * @param {{ searchFields?: string[], populate?: any }} opts
 */
export const createFactory = (Model, { searchFields = [], populate } = {}) => ({
  list: asyncHandler(async (req, res) => {
    const qb = new QueryBuilder(Model.find(), req.query)
      .search(searchFields)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    if (populate) qb.query = qb.query.populate(populate);

    const [data, total] = await Promise.all([qb.exec(), qb.count()]);
    sendResponse(res, {
      message: `${Model.modelName} list`,
      data,
      meta: buildMeta({ ...qb.pagination, total }),
    });
  }),

  getOne: asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    sendResponse(res, { data: doc, message: `${Model.modelName} detail` });
  }),

  create: asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    sendResponse(res, { statusCode: 201, data: doc, message: `${Model.modelName} created` });
  }),

  update: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    sendResponse(res, { data: doc, message: `${Model.modelName} updated` });
  }),

  remove: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    sendResponse(res, { data: { id: doc._id }, message: `${Model.modelName} deleted` });
  }),
});
