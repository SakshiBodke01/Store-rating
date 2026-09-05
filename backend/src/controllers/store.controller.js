import { StoreService } from '../services/store.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class StoreController {
  /**
   * User store search and listing.
   * @route GET /api/v1/stores
   */
  static getStores = asyncHandler(async (req, res) => {
    const { items, meta } = await StoreService.getStoresForUser(req.user.id, req.query);
    return sendPaginated(res, items, meta, 'Stores retrieved successfully');
  });

  /**
   * Submit or update rating for a store.
   * @route POST /api/v1/stores/:storeId/ratings
   * @route PATCH /api/v1/stores/:storeId/ratings
   */
  static submitRating = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const result = await StoreService.submitOrUpdateRating(req.user.id, storeId, req.body);
    return sendSuccess(res, result, 'Rating saved successfully', 200);
  });

  /**
   * Retrieve logged-in user's rating for a specific store.
   * @route GET /api/v1/stores/:storeId/my-rating
   */
  static getMyRating = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const rating = await StoreService.getUserRatingForStore(req.user.id, storeId);
    return sendSuccess(res, rating, 'User rating retrieved', 200);
  });
}
