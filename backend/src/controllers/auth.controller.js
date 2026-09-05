import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class AuthController {
  /**
   * Public registration endpoint (USER role only).
   * @route POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.registerPublicUser(req.body);
    return sendSuccess(res, result, 'User registered successfully', 201);
  });

  /**
   * User login endpoint.
   * @route POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req, res) => {
    const result = await AuthService.loginUser(req.body);
    return sendSuccess(res, result, 'Login successful', 200);
  });

  /**
   * Current authenticated user profile endpoint.
   * @route GET /api/v1/auth/me
   */
  static getMe = asyncHandler(async (req, res) => {
    const profile = await AuthService.getUserProfile(req.user.id);
    return sendSuccess(res, profile, 'User profile retrieved', 200);
  });

  /**
   * Password update endpoint for authenticated user.
   * @route PATCH /api/v1/users/me/password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const result = await AuthService.changePassword(req.user.id, req.body);
    return sendSuccess(res, result, 'Password updated successfully', 200);
  });
}
