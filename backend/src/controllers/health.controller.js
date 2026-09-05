import { HealthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class HealthController {
  /**
   * Health check endpoint controller.
   * @route GET /api/v1/health
   */
  static getHealth = asyncHandler(async (req, res) => {
    const healthData = HealthService.getSystemHealth();
    return sendSuccess(res, healthData, 'System is healthy and operational', 200);
  });
}
