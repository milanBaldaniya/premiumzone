import Setting from '../models/setting.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';

/** Public — storefront settings consumed by the client (store name, social…). */
export const getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.getSettings();
  const { store, shipping, social, features, seo } = settings;
  sendResponse(res, { data: { store, shipping, social, features, seo }, message: 'Settings' });
});

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.getSettings();
  sendResponse(res, { data: settings, message: 'Settings' });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOneAndUpdate({ key: 'global' }, { $set: req.body }, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  sendResponse(res, { data: settings, message: 'Settings updated' });
});
