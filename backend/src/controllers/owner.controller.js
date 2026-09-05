import { OwnerService } from '../services/owner.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class OwnerController {
  /**
   * Store Owner dashboard endpoint.
   * @route GET /api/v1/owner/dashboard
   */
  static getDashboard = asyncHandler(async (req, res) => {
    const data = await OwnerService.getOwnerDashboard(req.user.id, req.query);
    return sendSuccess(res, data, 'Store Owner dashboard data retrieved', 200);
  });
}
