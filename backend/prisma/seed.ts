import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // 1. Clear existing data
  console.log('🧹 Cleaning database tables...');
  await prisma.userSavedCoupon.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Default Admin
  console.log('👤 Creating default administrator...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Genie Admin',
      email: 'admin@coupongenie.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.email} (password: admin123)`);

  // 3. Create Default Stores
  console.log('🏪 Creating popular stores...');
  
  const storesData = [
    {
      name: 'Amazon',
      slug: 'amazon',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Find incredible savings across electronics, books, apparel, home essentials, and smart devices at Amazon.',
      category: 'Shopping',
    },
    {
      name: 'Flipkart',
      slug: 'flipkart',
      logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Shop India\'s leading e-commerce store for fashion, mobile phones, large home appliances, and daily items.',
      category: 'Shopping',
    },
    {
      name: 'Myntra',
      slug: 'myntra',
      logo: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Your one-stop destination for lifestyle and fashion. Discover clothing, activewear, cosmetics, and lifestyle accessories.',
      category: 'Fashion',
    },
    {
      name: 'Swiggy',
      slug: 'swiggy',
      logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Craving delicious meals or instant groceries? Get food and daily products delivered to your doorstep in minutes.',
      category: 'Food',
    },
    {
      name: 'Zomato',
      slug: 'zomato',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Discover great dining options near you, view menus, read reviews, and order meals online with great food cashbacks.',
      category: 'Food',
    },
  ];

  const stores: { [key: string]: any } = {};

  for (const storeData of storesData) {
    const store = await prisma.store.create({ data: storeData });
    stores[storeData.slug] = store;
    console.log(`✅ Created store: ${store.name}`);
  }

  // 4. Create Coupons
  console.log('🎟️ Creating discount coupons...');

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const couponsData = [
    // Amazon Coupons
    {
      storeId: stores['amazon'].id,
      couponCode: 'AMZNEW20',
      title: 'Flat 20% Off on Amazon Devices',
      description: 'Get an extra 20% discount on Kindle e-readers, Echo smart speakers, and Fire TV sticks.',
      discountType: 'PERCENTAGE',
      discountValue: 20.0,
      expiryDate: nextMonth,
      active: true,
      terms: 'Minimum purchase of $50 required. Applicable on first Amazon device purchase only.',
      revealCount: 142,
    },
    {
      storeId: stores['amazon'].id,
      couponCode: 'AMZSAV50',
      title: 'Save $50 on Electronics Purchases',
      description: 'Save big when upgrading your workstation, monitors, or audio headsets.',
      discountType: 'FLAT',
      discountValue: 50.0,
      expiryDate: nextWeek,
      active: true,
      terms: 'Minimum order value of $250 required. Cannot be clubbed with other bank offers.',
      revealCount: 98,
    },
    {
      storeId: stores['amazon'].id,
      couponCode: 'AMZEXP10',
      title: '10% Off Amazon Fresh Orders',
      description: 'Enjoy 10% off your next organic grocery order.',
      discountType: 'PERCENTAGE',
      discountValue: 10.0,
      expiryDate: lastMonth, // Expired
      active: true,
      terms: 'Only applicable to prime members on orders above $30.',
      revealCount: 230,
    },

    // Flipkart Coupons
    {
      storeId: stores['flipkart'].id,
      couponCode: 'FLIPFEST15',
      title: '15% Off Fashion and Lifestyle Accessories',
      description: 'Elevate your seasonal wardrobe with 15% off shoes, jackets, and accessories.',
      discountType: 'PERCENTAGE',
      discountValue: 15.0,
      expiryDate: nextMonth,
      active: true,
      terms: 'Valid on selected apparel brands. No minimum purchase required.',
      revealCount: 88,
    },
    {
      storeId: stores['flipkart'].id,
      couponCode: 'FLIPNEW500',
      title: 'Flat ₹500 Off on Mobiles',
      description: 'Flat discount on top Android smartphone brands.',
      discountType: 'FLAT',
      discountValue: 500.0,
      expiryDate: nextWeek,
      active: true,
      terms: 'Applicable on smartphone purchases above ₹12,000.',
      revealCount: 312,
    },

    // Myntra Coupons
    {
      storeId: stores['myntra'].id,
      couponCode: 'MYNTRA30',
      title: 'Flat 30% Off on Premium Brands',
      description: 'Refresh your activewear and casual clothing collection with a huge discount.',
      discountType: 'PERCENTAGE',
      discountValue: 30.0,
      expiryDate: nextMonth,
      active: true,
      terms: 'Applicable on select styles. Minimum purchase value of ₹1,999.',
      revealCount: 421,
    },
    {
      storeId: stores['myntra'].id,
      couponCode: 'MYNFREE',
      title: 'Free Delivery + ₹100 Cashback',
      description: 'Enjoy free shipping and a cash credit on your first purchase.',
      discountType: 'FLAT',
      discountValue: 100.0,
      expiryDate: nextWeek,
      active: true,
      terms: 'Valid on first-time users only.',
      revealCount: 512,
    },

    // Swiggy Coupons
    {
      storeId: stores['swiggy'].id,
      couponCode: 'SWIGIT50',
      title: '50% Off on Food Deliveries',
      description: 'Satisfy your food cravings with a massive 50% discount at top-rated local eateries.',
      discountType: 'PERCENTAGE',
      discountValue: 50.0,
      expiryDate: nextWeek,
      active: true,
      terms: 'Maximum discount of ₹120. Valid on orders above ₹149.',
      revealCount: 824,
    },
    {
      storeId: stores['swiggy'].id,
      couponCode: 'INSTAMART100',
      title: 'Flat ₹100 Off on Instamart Groceries',
      description: 'Get snacks, dairy, vegetables, and household essentials at extra low prices.',
      discountType: 'FLAT',
      discountValue: 100.0,
      expiryDate: nextMonth,
      active: true,
      terms: 'Valid on Swiggy Instamart orders above ₹499.',
      revealCount: 462,
    },

    // Zomato Coupons
    {
      storeId: stores['zomato'].id,
      couponCode: 'ZOMPAYDAY',
      title: '40% Off + Free Delivery',
      description: 'Treat yourself to your favorite meals with 40% savings.',
      discountType: 'PERCENTAGE',
      discountValue: 40.0,
      expiryDate: nextWeek,
      active: true,
      terms: 'Maximum discount ₹100. Applicable to online card payments only.',
      revealCount: 712,
    },
    {
      storeId: stores['zomato'].id,
      couponCode: 'GOLDWELCOME',
      title: 'Flat ₹150 Off for Zomato Gold Members',
      description: 'Special welcome coupon for newly enrolled Zomato Gold members.',
      discountType: 'FLAT',
      discountValue: 150.0,
      expiryDate: nextMonth,
      active: true,
      terms: 'Valid at Gold partner restaurants on orders exceeding ₹300.',
      revealCount: 390,
    },
  ];

  for (const couponData of couponsData) {
    const coupon = await prisma.coupon.create({ data: couponData });
    console.log(`   ✅ Created coupon: ${coupon.couponCode} for store ID: ${coupon.storeId}`);
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
