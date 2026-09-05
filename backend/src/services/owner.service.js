import prisma from '../config/prisma.js';

export class OwnerService {
  /**
   * Retrieves dashboard analytics and rating details exclusively for stores owned by the authenticated STORE_OWNER.
   * Enforces strict owner isolation.
   * @param {string} ownerId - Authenticated Store Owner User ID
   * @param {Object} query - Express request query parameters
   */
  static async getOwnerDashboard(ownerId, query) {
    const storeIdFilter = query.storeId;

    // Fetch all stores owned by this owner
    const ownedStores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true, address: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Format stores with calculated average rating and list of rating users
    const storesSummary = ownedStores.map((store) => {
      const ratings = store.ratings || [];
      const ratingCount = ratings.length;
      const avg = ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
      const averageRating = parseFloat(avg.toFixed(2));

      const ratingUsers = ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          address: r.user.address,
        },
      }));

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        description: store.description,
        averageRating,
        ratingCount,
        ratings: ratingUsers,
      };
    });

    // If specific store requested, filter result
    if (storeIdFilter) {
      const filtered = storesSummary.filter((s) => s.id === storeIdFilter);
      return { stores: filtered };
    }

    return { stores: storesSummary };
  }
}
