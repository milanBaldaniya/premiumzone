/**
 * Seeds baseline data: a super-admin, storefront settings, a couple of
 * brands/categories and sample products. Safe to re-run (upserts by key).
 *
 *   npm run seed
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { ROLES, PRODUCT_STATUS } from '../constants/index.js';
import User from '../models/user.model.js';
import Brand from '../models/brand.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import Setting from '../models/setting.model.js';

const run = async () => {
  await connectDB();
  logger.info('🌱 Seeding database...');

  // Settings singleton
  await Setting.getSettings();

  // Admin accounts (credentials sourced from .env)
  const upsertStaff = async ({ name, email, password, role }) => {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password, role, isEmailVerified: true });
      logger.info(`👑 ${role} created → ${email} / ${password}`);
    } else {
      // Keep role/verified in sync; reset password to the configured value
      user.role = role;
      user.password = password;
      user.isEmailVerified = true;
      await user.save();
      logger.info(`🔄 ${role} updated → ${email}`);
    }
    return user;
  };

  const superAdmin = await upsertStaff({
    name: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
    role: ROLES.SUPER_ADMIN,
  });
  await upsertStaff({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: ROLES.ADMIN,
  });

  const admin = superAdmin; // used as createdBy for sample products

  // Find-or-create via .create() so document hooks run (slug generation, etc).
  // findOneAndUpdate + upsert would bypass pre('validate') and leave slug null.
  const findOrCreate = async (Model, query, data) => {
    const existing = await Model.findOne(query);
    if (existing) return existing;
    return Model.create({ ...query, ...data });
  };

  // Brands
  const brandNames = ['Rolex', 'Apple', 'Samsung', 'Nothing', 'Fossil', 'Titan'];
  const brands = {};
  for (const name of brandNames) {
    brands[name] = await findOrCreate(Brand, { name }, { isFeatured: true, country: 'International' });
  }

  // Categories
  const catNames = ['Luxury Watches', 'Smart Watches', 'Audio', 'Wearables'];
  const cats = {};
  for (const name of catNames) {
    cats[name] = await findOrCreate(Category, { name }, { isFeatured: true });
  }

  // Sample products
  const samples = [
    {
      name: 'Rolex Submariner Date',
      sku: 'ROLEX-SUB-126610',
      price: 14500,
      discountPrice: 13990,
      brand: brands.Rolex._id,
      category: cats['Luxury Watches']._id,
      warranty: '5 Years International',
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: 'Apple Watch Ultra 2',
      sku: 'APPLE-WU2-49',
      price: 799,
      brand: brands.Apple._id,
      category: cats['Smart Watches']._id,
      warranty: '1 Year',
      isTrending: true,
      isNewArrival: true,
    },
    {
      name: 'Nothing Ear (2)',
      sku: 'NOTHING-EAR2',
      price: 149,
      brand: brands.Nothing._id,
      category: cats.Audio._id,
      warranty: '1 Year',
      isNewArrival: true,
    },
  ];

  for (const s of samples) {
    await findOrCreate(Product, { sku: s.sku }, {
      ...s,
      description: `${s.name} — a benchmark of craftsmanship and precision engineering.`,
      shortDescription: `Premium ${s.name}.`,
      stock: 25,
      status: PRODUCT_STATUS.ACTIVE,
      createdBy: admin._id,
    });
  }

  logger.info('✅ Seed complete');
  await disconnectDB();
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
