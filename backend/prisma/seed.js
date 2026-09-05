import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';

const { PrismaClient } = pkg;
const Role = pkg.Role || { ADMIN: 'ADMIN', STORE_OWNER: 'STORE_OWNER', USER: 'USER' };
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with authentic Marathi Indian records & rich metadata...');

  // Password hash for seed users (Password@123)
  const defaultPassword = 'Password@123';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

  // 1. Seed Admin User (Marathi Name)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@storerating.com' },
    update: {
      name: 'Aditya Kulkarni',
      role: Role.ADMIN,
      passwordHash,
      address: 'FC Road, Shivajinagar, Pune, Maharashtra',
    },
    create: {
      name: 'Aditya Kulkarni',
      email: 'admin@storerating.com',
      passwordHash,
      role: Role.ADMIN,
      address: 'FC Road, Shivajinagar, Pune, Maharashtra',
    },
  });
  console.log(`✅ Admin User created: ${adminUser.name} (${adminUser.email})`);

  // 2. Seed Primary Store Owner User (Marathi Name)
  const storeOwner1 = await prisma.user.upsert({
    where: { email: 'owner@storerating.com' },
    update: {
      name: 'Rajesh Deshmukh',
      role: Role.STORE_OWNER,
      passwordHash,
      address: 'Sadashiv Peth, Pune, Maharashtra',
    },
    create: {
      name: 'Rajesh Deshmukh',
      email: 'owner@storerating.com',
      passwordHash,
      role: Role.STORE_OWNER,
      address: 'Sadashiv Peth, Pune, Maharashtra',
    },
  });
  console.log(`✅ Store Owner created: ${storeOwner1.name} (${storeOwner1.email})`);

  // 3. Seed Secondary Store Owner User (Marathi Name)
  const storeOwner2 = await prisma.user.upsert({
    where: { email: 'sachin.patil@storerating.com' },
    update: {
      name: 'Sachin Patil',
      role: Role.STORE_OWNER,
      passwordHash,
      address: 'Aundh, Pune, Maharashtra',
    },
    create: {
      name: 'Sachin Patil',
      email: 'sachin.patil@storerating.com',
      passwordHash,
      role: Role.STORE_OWNER,
      address: 'Aundh, Pune, Maharashtra',
    },
  });
  console.log(`✅ Secondary Store Owner created: ${storeOwner2.name} (${storeOwner2.email})`);

  // 4. Seed Normal User (Marathi Name)
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@storerating.com' },
    update: {
      name: 'Ananya Deshpande',
      role: Role.USER,
      passwordHash,
      address: 'Kothrud, Pune, Maharashtra',
    },
    create: {
      name: 'Ananya Deshpande',
      email: 'user@storerating.com',
      passwordHash,
      role: Role.USER,
      address: 'Kothrud, Pune, Maharashtra',
    },
  });
  console.log(`✅ Normal User created: ${normalUser.name} (${normalUser.email})`);

  // 5. Seed Authentic Marathi Stores with Category & Verification Metadata
  const store1 = await prisma.store.upsert({
    where: { id: 'store-shree-ganesh-001' },
    update: {
      name: 'Shree Ganesh Electronics & Appliances',
      email: 'contact@shreeganesh.in',
      address: 'JM Road, Deccan Gymkhana, Pune',
      description: 'Top quality laptops, smartphones, and home appliances in Pune.',
      category: 'Electronics & Tech',
      phone: '+91 98220 12345',
      isVerified: true,
      ownerId: storeOwner1.id,
    },
    create: {
      id: 'store-shree-ganesh-001',
      name: 'Shree Ganesh Electronics & Appliances',
      email: 'contact@shreeganesh.in',
      address: 'JM Road, Deccan Gymkhana, Pune',
      description: 'Top quality laptops, smartphones, and home appliances in Pune.',
      category: 'Electronics & Tech',
      phone: '+91 98220 12345',
      isVerified: true,
      ownerId: storeOwner1.id,
    },
  });
  console.log(`🏬 Store created: ${store1.name}`);

  const store2 = await prisma.store.upsert({
    where: { id: 'store-puneri-amrittulya-002' },
    update: {
      name: 'Puneri Amrittulya & Cafe',
      email: 'info@puneriamrittulya.com',
      address: 'FC Road, Shivajinagar, Pune',
      description: 'Famous authentic Maharashtrian tea, misal pav, and fresh snacks.',
      category: 'Cafe & Food',
      phone: '+91 98220 23456',
      isVerified: true,
      ownerId: storeOwner1.id,
    },
    create: {
      id: 'store-puneri-amrittulya-002',
      name: 'Puneri Amrittulya & Cafe',
      email: 'info@puneriamrittulya.com',
      address: 'FC Road, Shivajinagar, Pune',
      description: 'Famous authentic Maharashtrian tea, misal pav, and fresh snacks.',
      category: 'Cafe & Food',
      phone: '+91 98220 23456',
      isVerified: true,
      ownerId: storeOwner1.id,
    },
  });
  console.log(`🏬 Store created: ${store2.name}`);

  const store3 = await prisma.store.upsert({
    where: { id: 'store-chitale-sweets-003' },
    update: {
      name: 'Chitale Sweets & Dairy',
      email: 'orders@chitalesweets.in',
      address: 'Laxmi Road, Sadashiv Peth, Pune',
      description: 'Authentic Bakarwadi, Puran Poli, and traditional Maharashtrian sweets.',
      category: 'Sweets & Confectionery',
      phone: '+91 98220 34567',
      isVerified: true,
      ownerId: storeOwner2.id,
    },
    create: {
      id: 'store-chitale-sweets-003',
      name: 'Chitale Sweets & Dairy',
      email: 'orders@chitalesweets.in',
      address: 'Laxmi Road, Sadashiv Peth, Pune',
      description: 'Authentic Bakarwadi, Puran Poli, and traditional Maharashtrian sweets.',
      category: 'Sweets & Confectionery',
      phone: '+91 98220 34567',
      isVerified: true,
      ownerId: storeOwner2.id,
    },
  });
  console.log(`🏬 Store created: ${store3.name}`);

  const store4 = await prisma.store.upsert({
    where: { id: 'store-swarajya-cloth-004' },
    update: {
      name: 'Swarajya Cloth Store & Paithani Sarees',
      email: 'sales@swarajyacloth.in',
      address: 'Tulshibaug Market, Pune',
      description: 'Traditional Paithani sarees, dhoti kurtas, and ethnic Maharashtrian wear.',
      category: 'Fashion & Paithani',
      phone: '+91 98220 45678',
      isVerified: true,
      ownerId: storeOwner2.id,
    },
    create: {
      id: 'store-swarajya-cloth-004',
      name: 'Swarajya Cloth Store & Paithani Sarees',
      email: 'sales@swarajyacloth.in',
      address: 'Tulshibaug Market, Pune',
      description: 'Traditional Paithani sarees, dhoti kurtas, and ethnic Maharashtrian wear.',
      category: 'Fashion & Paithani',
      phone: '+91 98220 45678',
      isVerified: true,
      ownerId: storeOwner2.id,
    },
  });
  console.log(`🏬 Store created: ${store4.name}`);

  // 6. Seed Sample Ratings with authentic feedback
  const rating1 = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser.id,
        storeId: store1.id,
      },
    },
    update: {
      rating: 5,
      comment: 'Uttam service ani changle products! Fast delivery on JM Road.',
    },
    create: {
      userId: normalUser.id,
      storeId: store1.id,
      rating: 5,
      comment: 'Uttam service ani changle products! Fast delivery on JM Road.',
    },
  });

  const rating2 = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser.id,
        storeId: store2.id,
      },
    },
    update: {
      rating: 5,
      comment: 'Best Misal Pav and Kadak Chaha on FC Road! Very hygienic.',
    },
    create: {
      userId: normalUser.id,
      storeId: store2.id,
      rating: 5,
      comment: 'Best Misal Pav and Kadak Chaha on FC Road! Very hygienic.',
    },
  });

  const rating3 = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser.id,
        storeId: store3.id,
      },
    },
    update: {
      rating: 5,
      comment: 'Authentic Bakarwadi is world class! Fresh sweets every morning.',
    },
    create: {
      userId: normalUser.id,
      storeId: store3.id,
      rating: 5,
      comment: 'Authentic Bakarwadi is world class! Fresh sweets every morning.',
    },
  });

  console.log('✨ Seeding completed with rich metadata & Marathi records!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
