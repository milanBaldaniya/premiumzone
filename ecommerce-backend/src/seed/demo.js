/**
 * Rich DEMO data seeder — populates every collection with realistic, connected
 * data so the storefront, admin dashboard and analytics all look alive.
 *
 *   npm run seed:demo
 *
 * Safe to re-run: it wipes demo collections (products, orders, reviews, coupons,
 * addresses, wishlists, carts, notifications, banners, blogs and CUSTOMER users)
 * then rebuilds them. Staff accounts (admin/super_admin) and settings are kept.
 * Run `npm run seed` first if you haven't created the admin accounts yet.
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import {
  ROLES,
  PRODUCT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  COUPON_TYPE,
  NOTIFICATION_TYPE,
} from '../constants/index.js';
import User from '../models/user.model.js';
import Brand from '../models/brand.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import Address from '../models/address.model.js';
import Coupon from '../models/coupon.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import Wishlist from '../models/wishlist.model.js';
import Cart from '../models/cart.model.js';
import Notification from '../models/notification.model.js';
import Banner from '../models/banner.model.js';
import Blog from '../models/blog.model.js';
import Setting from '../models/setting.model.js';

// ── Helpers ──────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (n-- > 0 && copy.length) out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
  return out;
};
const daysAgo = (d) => new Date(Date.now() - d * 86400000);
const img = (seed) => `https://picsum.photos/seed/${seed}/700/700`;
const finalPrice = (p) => (p.discountPrice > 0 ? p.discountPrice : p.price);

const findOrCreate = async (Model, query, data) => {
  const existing = await Model.findOne(query);
  return existing || Model.create({ ...query, ...data });
};

// ── Static content ───────────────────────────────────────
const BRANDS = [
  { name: 'Rolex', country: 'Switzerland' },
  { name: 'Apple', country: 'United States' },
  { name: 'Samsung', country: 'South Korea' },
  { name: 'Nothing', country: 'United Kingdom' },
  { name: 'Fossil', country: 'United States' },
  { name: 'Titan', country: 'India' },
];

const CATEGORIES = ['Luxury Watches', 'Smart Watches', 'Audio', 'Wearables', 'Accessories'];

// Product blueprints: [name, brand, category, price, discount, flags, warranty]
const PRODUCTS = [
  ['Rolex Submariner Date', 'Rolex', 'Luxury Watches', 14500, 13990, ['featured', 'bestseller'], '5 Years International'],
  ['Rolex Datejust 41', 'Rolex', 'Luxury Watches', 10200, 0, ['featured'], '5 Years International'],
  ['Rolex Daytona Cosmograph', 'Rolex', 'Luxury Watches', 28900, 0, ['featured', 'trending'], '5 Years International'],
  ['Rolex GMT-Master II', 'Rolex', 'Luxury Watches', 19500, 18750, ['bestseller'], '5 Years International'],
  ['Apple Watch Ultra 2', 'Apple', 'Smart Watches', 799, 0, ['trending', 'new', 'bestseller'], '1 Year'],
  ['Apple Watch Series 9', 'Apple', 'Smart Watches', 399, 379, ['trending', 'new'], '1 Year'],
  ['Apple Watch SE', 'Apple', 'Smart Watches', 249, 0, [], '1 Year'],
  ['Apple AirPods Pro 2', 'Apple', 'Audio', 249, 229, ['bestseller', 'trending'], '1 Year'],
  ['Apple AirPods Max', 'Apple', 'Audio', 549, 0, ['featured'], '1 Year'],
  ['Samsung Galaxy Watch 6 Classic', 'Samsung', 'Smart Watches', 399, 349, ['trending'], '1 Year'],
  ['Samsung Galaxy Watch 6', 'Samsung', 'Smart Watches', 299, 0, ['new'], '1 Year'],
  ['Samsung Galaxy Buds 3 Pro', 'Samsung', 'Audio', 249, 219, ['new'], '1 Year'],
  ['Samsung Galaxy Ring', 'Samsung', 'Wearables', 399, 0, ['new', 'trending'], '1 Year'],
  ['Nothing Ear (2)', 'Nothing', 'Audio', 149, 0, ['new'], '1 Year'],
  ['Nothing Ear (a)', 'Nothing', 'Audio', 99, 89, ['bestseller'], '1 Year'],
  ['Nothing CMF Watch Pro', 'Nothing', 'Smart Watches', 69, 0, ['new'], '1 Year'],
  ['Fossil Gen 6 Smartwatch', 'Fossil', 'Smart Watches', 299, 249, [], '2 Years'],
  ['Fossil Machine Chronograph', 'Fossil', 'Luxury Watches', 179, 149, ['bestseller'], '2 Years'],
  ['Fossil Neutra Automatic', 'Fossil', 'Luxury Watches', 229, 0, [], '2 Years'],
  ['Titan Nebula Gold', 'Titan', 'Luxury Watches', 850, 799, ['featured'], '2 Years'],
  ['Titan Edge Ceramic', 'Titan', 'Luxury Watches', 320, 0, ['new'], '2 Years'],
  ['Titan Smart Pro', 'Titan', 'Smart Watches', 120, 99, ['bestseller'], '1 Year'],
  ['Premium Leather Watch Strap', 'Fossil', 'Accessories', 45, 39, [], '6 Months'],
  ['Milanese Loop Band', 'Apple', 'Accessories', 99, 0, [], '1 Year'],
];

const SPECS_BY_CATEGORY = {
  'Luxury Watches': [
    { key: 'Movement', value: 'Automatic Mechanical' },
    { key: 'Case Material', value: 'Stainless Steel' },
    { key: 'Water Resistance', value: '100m' },
    { key: 'Case Diameter', value: '41mm' },
  ],
  'Smart Watches': [
    { key: 'Display', value: 'AMOLED Always-On' },
    { key: 'Battery Life', value: 'Up to 36 hours' },
    { key: 'Connectivity', value: 'Bluetooth 5.3, Wi-Fi, GPS' },
    { key: 'Water Resistance', value: '5 ATM + IP68' },
  ],
  Audio: [
    { key: 'Driver', value: '11mm Dynamic' },
    { key: 'Noise Cancellation', value: 'Active ANC' },
    { key: 'Battery Life', value: 'Up to 30 hours (with case)' },
    { key: 'Connectivity', value: 'Bluetooth 5.3' },
  ],
  Wearables: [
    { key: 'Sensors', value: 'Heart Rate, SpO2, Temperature' },
    { key: 'Battery Life', value: 'Up to 7 days' },
    { key: 'Water Resistance', value: '10 ATM' },
  ],
  Accessories: [
    { key: 'Material', value: 'Genuine Leather' },
    { key: 'Compatibility', value: 'Universal 22mm' },
  ],
};

const FIRST = ['James', 'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia'];
const LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const CITIES = [
  ['New York', 'NY', '10001'], ['Los Angeles', 'CA', '90001'], ['Chicago', 'IL', '60601'],
  ['Houston', 'TX', '77001'], ['Miami', 'FL', '33101'], ['Seattle', 'WA', '98101'],
];

const REVIEW_TEXTS = [
  ['Absolutely stunning', 'Exceeded all my expectations. The craftsmanship is impeccable.'],
  ['Worth every penny', 'A true statement piece. Feels premium and looks even better in person.'],
  ['Excellent quality', 'Fast shipping and beautifully packaged. Highly recommend.'],
  ['Love it', 'Comfortable, elegant and reliable. My new favorite.'],
  ['Great value', 'Superb build quality for the price. Very happy with the purchase.'],
  ['Impressive', 'The attention to detail is remarkable. A joy to wear every day.'],
];

const BLOGS = [
  ['The Art of Mechanical Watchmaking', 'Guides', 'Explore the centuries-old craft behind luxury timepieces and what makes them tick.'],
  ['Smartwatch vs Classic: Which Suits You?', 'Comparison', 'A deep dive into choosing between timeless elegance and modern technology.'],
  ['Caring for Your Luxury Watch', 'Tips', 'Essential maintenance advice to keep your investment pristine for generations.'],
  ['2026 Watch Trends to Watch', 'Trends', 'From integrated bracelets to sustainable materials — the year ahead in horology.'],
  ['The History of the Dive Watch', 'Heritage', 'How the humble dive watch became an icon of both function and style.'],
];

// ── Seeder ───────────────────────────────────────────────
const run = async () => {
  await connectDB();
  logger.info('🎬 Seeding DEMO data...');

  await Setting.getSettings();
  const superAdmin =
    (await User.findOne({ role: ROLES.SUPER_ADMIN })) ||
    (await User.findOne({ role: ROLES.ADMIN }));
  if (!superAdmin) {
    logger.error('No admin user found — run `npm run seed` first.');
    process.exit(1);
  }

  // Wipe demo collections
  logger.info('🧹 Clearing existing demo data...');
  await Promise.all([
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    Address.deleteMany({}),
    Wishlist.deleteMany({}),
    Cart.deleteMany({}),
    Notification.deleteMany({}),
    Banner.deleteMany({}),
    Blog.deleteMany({}),
    User.deleteMany({ role: ROLES.CUSTOMER }),
  ]);

  // Brands + logos
  const brandMap = {};
  for (const b of BRANDS) {
    const brand = await findOrCreate(Brand, { name: b.name }, { country: b.country, isFeatured: true });
    brand.logo = { url: img(`logo-${b.name}`) };
    await brand.save();
    brandMap[b.name] = brand;
  }
  logger.info(`🏷️  ${Object.keys(brandMap).length} brands ready`);

  // Categories
  const catMap = {};
  for (const name of CATEGORIES) {
    const cat = await findOrCreate(Category, { name }, { isFeatured: true, image: { url: img(`cat-${name}`) } });
    catMap[name] = cat;
  }
  logger.info(`📂 ${Object.keys(catMap).length} categories ready`);

  // Products
  const products = [];
  for (const [name, brandKey, catKey, price, discount, flags, warranty] of PRODUCTS) {
    const sku = name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    const product = await Product.create({
      name,
      sku,
      description: `The ${name} represents the pinnacle of design and engineering from ${brandKey}. Meticulously crafted with premium materials, it combines timeless aesthetics with modern performance — a definitive statement of refined taste.`,
      shortDescription: `Premium ${name} by ${brandKey}.`,
      price,
      discountPrice: discount,
      brand: brandMap[brandKey]._id,
      category: catMap[catKey]._id,
      thumbnail: { url: img(sku), alt: name },
      gallery: [
        { url: img(sku), alt: name },
        { url: img(`${sku}-2`), alt: name },
        { url: img(`${sku}-3`), alt: name },
      ],
      specifications: SPECS_BY_CATEGORY[catKey] || [],
      stock: rand(3, 60),
      warranty,
      tags: [brandKey.toLowerCase(), catKey.toLowerCase().split(' ')[0], 'premium'],
      isFeatured: flags.includes('featured'),
      isTrending: flags.includes('trending'),
      isNewArrival: flags.includes('new'),
      isBestSeller: flags.includes('bestseller'),
      status: PRODUCT_STATUS.ACTIVE,
      createdBy: superAdmin._id,
      seo: { metaTitle: name, metaDescription: `Buy ${name} — authentic, warrantied, free shipping.` },
    });
    products.push(product);
  }
  logger.info(`⌚ ${products.length} products created`);

  // Customers (+ addresses)
  const customers = [];
  for (let i = 0; i < 12; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const email = `${first}.${last}${i}`.toLowerCase() + '@example.com';
    const user = await User.create({
      name: `${first} ${last}`,
      email,
      password: 'Password@123',
      phone: `+1 555 ${rand(100, 999)} ${rand(1000, 9999)}`,
      role: ROLES.CUSTOMER,
      isEmailVerified: Math.random() > 0.2,
      avatar: { url: img(`avatar-${i}`) },
      lastLoginAt: daysAgo(rand(0, 20)),
    });
    const [city, state, zip] = pick(CITIES);
    const address = await Address.create({
      user: user._id,
      fullName: user.name,
      phone: user.phone,
      line1: `${rand(10, 999)} ${pick(['Park Ave', 'Main St', 'Oak Rd', '5th Avenue', 'Sunset Blvd'])}`,
      city,
      state,
      postalCode: zip,
      country: 'United States',
      isDefault: true,
    });
    user.defaultAddress = address._id;
    await user.save({ validateBeforeSave: false });
    customers.push({ user, address });
  }
  logger.info(`👥 ${customers.length} customers + addresses created`);

  // Coupons
  const coupons = [
    { code: 'PPZ10', type: COUPON_TYPE.PERCENTAGE, value: 10, minOrderAmount: 200, maxDiscount: 500 },
    { code: 'WELCOME15', type: COUPON_TYPE.PERCENTAGE, value: 15, minOrderAmount: 100, maxDiscount: 300 },
    { code: 'SAVE50', type: COUPON_TYPE.FIXED, value: 50, minOrderAmount: 300 },
    { code: 'GADGET20', type: COUPON_TYPE.PERCENTAGE, value: 20, minOrderAmount: 150, maxDiscount: 200 },
    { code: 'VIP100', type: COUPON_TYPE.FIXED, value: 100, minOrderAmount: 1000 },
  ];
  for (const c of coupons) {
    await Coupon.create({
      ...c,
      description: `${c.type === 'percentage' ? `${c.value}% off` : `$${c.value} off`} orders over $${c.minOrderAmount}`,
      usageLimit: 100,
      usedCount: rand(0, 30),
      perUserLimit: 2,
      expiresAt: daysAgo(-60), // 60 days in the future
      isActive: true,
    });
  }
  logger.info(`🎟️  ${coupons.length} coupons created`);

  // Orders (backdated over 60 days, varied statuses) + review seeds
  const statusPool = [
    ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERED,
    ORDER_STATUS.SHIPPED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED,
  ];
  const reviewSeeds = []; // { product, user, order }
  let orderCount = 0;

  for (let i = 0; i < 40; i++) {
    const { user, address } = pick(customers);
    const chosen = sample(products, rand(1, 3));
    const items = chosen.map((p) => {
      const qty = rand(1, 2);
      const price = finalPrice(p);
      return {
        product: p._id,
        name: p.name,
        sku: p.sku,
        image: p.thumbnail.url,
        price,
        quantity: qty,
        subtotal: price * qty,
      };
    });
    const itemsTotal = items.reduce((s, it) => s + it.subtotal, 0);
    const shippingFee = itemsTotal >= 500 ? 0 : 15;
    const status = pick(statusPool);
    const createdAt = daysAgo(rand(0, 60));
    const snapshot = {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    const order = new Order({
      user: user._id,
      items,
      shippingAddress: snapshot,
      billingAddress: snapshot,
      itemsTotal,
      shippingFee,
      taxAmount: 0,
      discountAmount: 0,
      grandTotal: itemsTotal + shippingFee,
      currency: 'USD',
      paymentMethod: PAYMENT_METHOD.COD,
      paymentStatus: status === ORDER_STATUS.DELIVERED ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
      status,
      trackingNumber: [ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].includes(status)
        ? `TRK${rand(100000, 999999)}`
        : undefined,
      deliveredAt: status === ORDER_STATUS.DELIVERED ? createdAt : undefined,
    });
    await order.save();
    // Backdate without bumping updatedAt
    await Order.updateOne({ _id: order._id }, { $set: { createdAt, updatedAt: createdAt } }, { timestamps: false });
    orderCount++;

    if (status === ORDER_STATUS.DELIVERED) {
      // bump soldCount so best-sellers/top-products look real
      await Promise.all(
        items.map((it) => Product.updateOne({ _id: it.product }, { $inc: { soldCount: it.quantity } }))
      );
      // queue one review per delivered order (dedup by product+user)
      const p = chosen[0];
      if (!reviewSeeds.some((r) => r.product.equals(p._id) && r.user.equals(user._id))) {
        reviewSeeds.push({ product: p._id, user: user._id, order: order._id, createdAt });
      }
    }
  }
  logger.info(`🧾 ${orderCount} orders created`);

  // Reviews (from delivered purchases)
  for (const seed of reviewSeeds) {
    const [title, comment] = pick(REVIEW_TEXTS);
    await Review.create({
      product: seed.product,
      user: seed.user,
      order: seed.order,
      rating: rand(4, 5),
      title,
      comment,
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: rand(0, 25),
    });
  }
  // A few extra unverified/pending reviews for moderation demo
  for (let i = 0; i < 6; i++) {
    const p = pick(products);
    const { user } = pick(customers);
    const exists = await Review.findOne({ product: p._id, user: user._id });
    if (exists) continue;
    const [title, comment] = pick(REVIEW_TEXTS);
    await Review.create({
      product: p._id,
      user: user._id,
      rating: rand(3, 5),
      title,
      comment,
      isVerifiedPurchase: false,
      isApproved: Math.random() > 0.4,
    });
  }
  // Recalculate aggregate ratings deterministically
  for (const p of products) await Review.recalcRatings(p._id);
  logger.info(`⭐ ${reviewSeeds.length}+ reviews created`);

  // Wishlists
  for (const { user } of sample(customers, 7)) {
    await Wishlist.create({ user: user._id, products: sample(products, rand(3, 6)).map((p) => p._id) });
  }
  // Active carts
  for (const { user } of sample(customers, 4)) {
    const items = sample(products, rand(1, 3)).map((p) => ({
      product: p._id,
      quantity: rand(1, 2),
      priceSnapshot: finalPrice(p),
    }));
    await Cart.create({ user: user._id, items });
  }
  logger.info('❤️  Wishlists & carts created');

  // Notifications
  for (const { user } of sample(customers, 8)) {
    await Notification.create({
      user: user._id,
      type: NOTIFICATION_TYPE.ORDER,
      title: 'Order shipped',
      message: 'Your recent order is on its way! Track it from your account.',
      link: '/account/orders',
      isRead: Math.random() > 0.5,
    });
  }
  await Notification.create({
    audience: 'all',
    type: NOTIFICATION_TYPE.PROMO,
    title: 'Summer Sale is live 🎉',
    message: 'Enjoy up to 20% off select timepieces this week only.',
    link: '/products',
  });
  logger.info('🔔 Notifications created');

  // Banners
  const banners = [
    { title: 'The 2026 Collection', subtitle: 'Precision meets prestige', placement: 'hero', sortOrder: 1 },
    { title: 'Luxury Redefined', subtitle: 'Discover iconic timepieces', placement: 'hero', sortOrder: 2 },
    { title: 'Smart. Sleek. Seamless.', subtitle: 'Next-gen wearables', placement: 'hero', sortOrder: 3 },
    { title: 'Free Shipping Over $500', subtitle: 'Limited time offer', placement: 'promo', sortOrder: 1 },
  ];
  for (const b of banners) {
    await Banner.create({
      ...b,
      image: { url: img(`banner-${b.title}`) },
      ctaText: 'Shop Now',
      ctaLink: '/products',
      isActive: true,
    });
  }
  logger.info(`🖼️  ${banners.length} banners created`);

  // Blogs
  for (const [title, category, excerpt] of BLOGS) {
    await Blog.create({
      title,
      excerpt,
      content: `${excerpt}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      coverImage: { url: img(`blog-${title}`) },
      author: superAdmin._id,
      category,
      tags: [category.toLowerCase(), 'watches', 'luxury'],
      readTime: rand(3, 8),
      status: 'published',
      publishedAt: daysAgo(rand(1, 40)),
      viewsCount: rand(50, 2000),
    });
  }
  logger.info(`📝 ${BLOGS.length} blog posts created`);

  logger.info('✅ DEMO seed complete!');
  logger.info('   Storefront: products, banners, blogs, reviews all populated');
  logger.info('   Admin: dashboard analytics, orders, customers, coupons ready');
  logger.info('   Demo customer login → any *@example.com / Password@123');

  await disconnectDB();
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Demo seed failed: ${err.message}\n${err.stack}`);
  process.exit(1);
});
