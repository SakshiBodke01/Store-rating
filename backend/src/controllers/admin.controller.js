import { AdminService } from '../services/admin.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class AdminController {
  /**
   * Admin creates a new user.
   * @route POST /api/v1/admin/users
   */
  static createUser = asyncHandler(async (req, res) => {
    const user = await AdminService.createUserByAdmin(req.body);
    return sendSuccess(res, user, 'User created successfully by Admin', 201);
  });

  /**
   * Admin lists users with search, filtering, sorting, and pagination.
   * @route GET /api/v1/admin/users
   */
  static getUsers = asyncHandler(async (req, res) => {
    const { items, meta } = await AdminService.getUsers(req.query);
    return sendPaginated(res, items, meta, 'Users retrieved successfully');
  });

  /**
   * Admin fetches user details by ID.
   * @route GET /api/v1/admin/users/:id
   */
  static getUserById = asyncHandler(async (req, res) => {
    const user = await AdminService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User details retrieved successfully', 200);
  });

  /**
   * Admin adds a new store.
   * @route POST /api/v1/admin/stores
   */
  static createStore = asyncHandler(async (req, res) => {
    const store = await AdminService.createStoreByAdmin(req.body);
    return sendSuccess(res, store, 'Store created successfully', 201);
  });

  /**
   * Admin lists stores.
   * @route GET /api/v1/admin/stores
   */
  static getStores = asyncHandler(async (req, res) => {
    const { items, meta } = await AdminService.getStoresByAdmin(req.query);
    return sendPaginated(res, items, meta, 'Stores retrieved successfully');
  });

  /**
   * Admin dashboard stats.
   * @route GET /api/v1/admin/dashboard
   */
  static getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await AdminService.getAdminDashboardStats();
    return sendSuccess(res, stats, 'Admin dashboard statistics retrieved', 200);
  });
}
