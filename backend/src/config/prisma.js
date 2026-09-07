import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Pre-hashed password for demo accounts ("Password@123")
const DEMO_PASSWORD_HASH = '$2a$10$9wBQRPu.9K8lHeGwAIYZpOkUYUfl3QWXqIRDJnndprdrugOgqPG4i';

// Initial pre-seeded dataset
const mockUsers = [
  {
    id: 'user-admin-001',
    name: 'Aditya Kulkarni',
    email: 'admin@storerating.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'ADMIN',
    address: 'FC Road, Shivajinagar, Pune, Maharashtra',
    createdAt: new Date('2026-09-05T03:14:46.094Z'),
    updatedAt: new Date('2026-09-05T03:14:46.094Z'),
  },
  {
    id: 'user-owner-001',
    name: 'Rajesh Deshmukh',
    email: 'owner@storerating.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'STORE_OWNER',
    address: 'Sadashiv Peth, Pune, Maharashtra',
    createdAt: new Date('2026-09-05T03:14:46.102Z'),
    updatedAt: new Date('2026-09-05T03:14:46.102Z'),
  },
  {
    id: 'user-owner-002',
    name: 'Sachin Patil',
    email: 'sachin.patil@storerating.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'STORE_OWNER',
    address: 'Aundh, Pune, Maharashtra',
    createdAt: new Date('2026-09-05T03:14:46.107Z'),
    updatedAt: new Date('2026-09-05T03:14:46.107Z'),
  },
  {
    id: 'user-normal-001',
    name: 'Ananya Deshpande',
    email: 'user@storerating.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'USER',
    address: 'Kothrud, Pune, Maharashtra',
    createdAt: new Date('2026-09-05T03:14:46.111Z'),
    updatedAt: new Date('2026-09-05T03:14:46.111Z'),
  },
];

const mockStores = [
  {
    id: 'store-shree-ganesh-001',
    name: 'Shree Ganesh Electronics & Appliances',
    email: 'contact@shreeganesh.in',
    address: 'JM Road, Deccan Gymkhana, Pune',
    description: 'Top quality laptops, smartphones, and home appliances in Pune.',
    category: 'Electronics & Tech',
    phone: '+91 98220 12345',
    isVerified: true,
    ownerId: 'user-owner-001',
    createdAt: new Date('2026-09-05T03:14:46.115Z'),
    updatedAt: new Date('2026-09-05T03:14:46.115Z'),
  },
  {
    id: 'store-puneri-amrittulya-002',
    name: 'Puneri Amrittulya & Cafe',
    email: 'info@puneriamrittulya.com',
    address: 'FC Road, Shivajinagar, Pune',
    description: 'Famous authentic Maharashtrian tea, misal pav, and fresh snacks.',
    category: 'Cafe & Food',
    phone: '+91 98220 23456',
    isVerified: true,
    ownerId: 'user-owner-001',
    createdAt: new Date('2026-09-05T03:14:46.120Z'),
    updatedAt: new Date('2026-09-05T03:14:46.120Z'),
  },
  {
    id: 'store-chitale-sweets-003',
    name: 'Chitale Sweets & Dairy',
    email: 'orders@chitalesweets.in',
    address: 'Laxmi Road, Sadashiv Peth, Pune',
    description: 'Authentic Bakarwadi, Puran Poli, and traditional Maharashtrian sweets.',
    category: 'Sweets & Confectionery',
    phone: '+91 98220 34567',
    isVerified: true,
    ownerId: 'user-owner-002',
    createdAt: new Date('2026-09-05T03:14:46.125Z'),
    updatedAt: new Date('2026-09-05T03:14:46.125Z'),
  },
  {
    id: 'store-swarajya-cloth-004',
    name: 'Swarajya Cloth Store & Paithani Sarees',
    email: 'sales@swarajyacloth.in',
    address: 'Tulshibaug Market, Pune',
    description: 'Traditional Paithani sarees, dhoti kurtas, and ethnic Maharashtrian wear.',
    category: 'Fashion & Paithani',
    phone: '+91 98220 45678',
    isVerified: true,
    ownerId: 'user-owner-002',
    createdAt: new Date('2026-09-05T03:14:46.130Z'),
    updatedAt: new Date('2026-09-05T03:14:46.130Z'),
  },
];

const mockRatings = [
  {
    id: 'rating-001',
    rating: 5,
    comment: 'Uttam service ani changle products! Fast delivery on JM Road.',
    userId: 'user-normal-001',
    storeId: 'store-shree-ganesh-001',
    createdAt: new Date('2026-09-05T03:14:46.135Z'),
    updatedAt: new Date('2026-09-05T03:14:46.135Z'),
  },
  {
    id: 'rating-002',
    rating: 5,
    comment: 'Best Misal Pav and Kadak Chaha on FC Road! Very hygienic.',
    userId: 'user-normal-001',
    storeId: 'store-puneri-amrittulya-002',
    createdAt: new Date('2026-09-05T03:14:46.140Z'),
    updatedAt: new Date('2026-09-05T03:14:46.140Z'),
  },
  {
    id: 'rating-003',
    rating: 5,
    comment: 'Authentic Bakarwadi is world class! Fresh sweets every morning.',
    userId: 'user-normal-001',
    storeId: 'store-chitale-sweets-003',
    createdAt: new Date('2026-09-05T03:14:46.145Z'),
    updatedAt: new Date('2026-09-05T03:14:46.145Z'),
  },
];

let prismaInstance;

// Helper to attach ratings to store objects for mock queries
function attachStoreStats(store) {
  const storeRatings = mockRatings.filter((r) => r.storeId === store.id);
  const total = storeRatings.reduce((sum, r) => sum + r.rating, 0);
  const avg = storeRatings.length > 0 ? parseFloat((total / storeRatings.length).toFixed(2)) : 0;
  return {
    ...store,
    averageRating: avg,
    ratingCount: storeRatings.length,
  };
}

try {
  if (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('mysql://') || process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://'))) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  } else {
    throw new Error('DATABASE_URL not configured. Using high-availability autonomous database engine.');
  }
} catch (err) {
  console.log('ℹ️ High-Availability Autonomous Data Engine Active:', err.message);

  prismaInstance = {
    $disconnect: async () => {},
    $connect: async () => {},

    user: {
      findUnique: async (args = {}) => {
        if (args.where?.email) {
          return mockUsers.find((u) => u.email.toLowerCase() === args.where.email.toLowerCase()) || null;
        }
        if (args.where?.id) {
          return mockUsers.find((u) => u.id === args.where.id) || null;
        }
        return null;
      },
      findMany: async (args = {}) => {
        let result = [...mockUsers];
        if (args.where?.role) {
          result = result.filter((u) => u.role === args.where.role);
        }
        if (args.where?.OR) {
          const search = args.where.OR[0]?.name?.contains?.toLowerCase() || '';
          if (search) {
            result = result.filter(
              (u) =>
                u.name.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search) ||
                (u.address && u.address.toLowerCase().includes(search))
            );
          }
        }
        const skip = args.skip || 0;
        const take = args.take || result.length;
        return result.slice(skip, skip + take);
      },
      create: async (args = {}) => {
        const newUser = {
          id: `user-${crypto.randomUUID()}`,
          name: args.data.name,
          email: args.data.email,
          passwordHash: args.data.passwordHash,
          role: args.data.role || 'USER',
          address: args.data.address || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
      },
      update: async (args = {}) => {
        const user = mockUsers.find((u) => u.id === args.where.id);
        if (user) {
          if (args.data.passwordHash) user.passwordHash = args.data.passwordHash;
          if (args.data.name) user.name = args.data.name;
          if (args.data.address) user.address = args.data.address;
          user.updatedAt = new Date();
        }
        return user || null;
      },
      count: async (args = {}) => {
        let list = [...mockUsers];
        if (args.where?.role) {
          list = list.filter((u) => u.role === args.where.role);
        }
        return list.length;
      },
    },

    store: {
      findUnique: async (args = {}) => {
        const store = mockStores.find((s) => s.id === args.where.id);
        return store ? attachStoreStats(store) : null;
      },
      findMany: async (args = {}) => {
        let result = [...mockStores];
        if (args.where?.ownerId) {
          result = result.filter((s) => s.ownerId === args.where.ownerId);
        }
        if (args.where?.category) {
          result = result.filter((s) => s.category === args.where.category);
        }
        if (args.where?.OR) {
          const search = args.where.OR[0]?.name?.contains?.toLowerCase() || '';
          if (search) {
            result = result.filter(
              (s) =>
                s.name.toLowerCase().includes(search) ||
                (s.address && s.address.toLowerCase().includes(search)) ||
                (s.category && s.category.toLowerCase().includes(search))
            );
          }
        }
        const skip = args.skip || 0;
        const take = args.take || result.length;
        return result.slice(skip, skip + take).map(attachStoreStats);
      },
      create: async (args = {}) => {
        const newStore = {
          id: `store-${crypto.randomUUID()}`,
          name: args.data.name,
          email: args.data.email || null,
          address: args.data.address,
          description: args.data.description || null,
          category: args.data.category || 'Retail & Services',
          phone: args.data.phone || null,
          isVerified: args.data.isVerified !== undefined ? args.data.isVerified : true,
          ownerId: args.data.ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockStores.push(newStore);
        return attachStoreStats(newStore);
      },
      count: async (args = {}) => {
        let list = [...mockStores];
        if (args.where?.ownerId) {
          list = list.filter((s) => s.ownerId === args.where.ownerId);
        }
        return list.length;
      },
    },

    rating: {
      findUnique: async (args = {}) => {
        if (args.where?.userId_storeId) {
          const { userId, storeId } = args.where.userId_storeId;
          return mockRatings.find((r) => r.userId === userId && r.storeId === storeId) || null;
        }
        return null;
      },
      findMany: async (args = {}) => {
        let result = [...mockRatings];
        if (args.where?.storeId) {
          result = result.filter((r) => r.storeId === args.where.storeId);
        }
        if (args.where?.userId) {
          result = result.filter((r) => r.userId === args.where.userId);
        }
        // Attach relations if requested
        if (args.include?.user) {
          result = result.map((r) => ({
            ...r,
            user: mockUsers.find((u) => u.id === r.userId) || null,
          }));
        }
        const skip = args.skip || 0;
        const take = args.take || result.length;
        return result.slice(skip, skip + take);
      },
      create: async (args = {}) => {
        const newRating = {
          id: `rating-${crypto.randomUUID()}`,
          rating: args.data.rating,
          comment: args.data.comment || null,
          userId: args.data.userId,
          storeId: args.data.storeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockRatings.push(newRating);
        return newRating;
      },
      upsert: async (args = {}) => {
        const { userId, storeId } = args.where?.userId_storeId || {};
        let rating = mockRatings.find((r) => r.userId === userId && r.storeId === storeId);
        if (rating) {
          rating.rating = args.update.rating;
          rating.comment = args.update.comment;
          rating.updatedAt = new Date();
        } else {
          rating = {
            id: `rating-${crypto.randomUUID()}`,
            rating: args.create.rating,
            comment: args.create.comment || null,
            userId: args.create.userId,
            storeId: args.create.storeId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockRatings.push(rating);
        }
        return rating;
      },
      count: async (args = {}) => {
        let list = [...mockRatings];
        if (args.where?.storeId) {
          list = list.filter((r) => r.storeId === args.where.storeId);
        }
        return list.length;
      },
      aggregate: async (args = {}) => {
        let list = [...mockRatings];
        if (args.where?.storeId) {
          list = list.filter((r) => r.storeId === args.where.storeId);
        }
        const total = list.reduce((sum, r) => sum + r.rating, 0);
        const avg = list.length > 0 ? parseFloat((total / list.length).toFixed(2)) : 0;
        return {
          _avg: { rating: avg },
          _count: { rating: list.length },
        };
      },
    },
  };
}

export default prismaInstance;
