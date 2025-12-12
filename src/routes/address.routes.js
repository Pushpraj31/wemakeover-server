import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  validateAddressCreation,
  validateAddressUpdate,
  sanitizeAddressData,
  checkAddressOwnership,
  checkAddressLimit,
  validateAddressId,
  checkUserHasAddresses,
  validateDefaultAddressLogic
} from '../middlewares/address.middleware.js';
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  getDefaultAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  permanentlyDeleteAddress,
  restoreAddress,
  getAddressStats,
  checkUserAddressStatus
} from '../controllers/address.controller.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Address CRUD Routes

// POST /api/addresses - Create a new address
router.post(
  '/',
  sanitizeAddressData,
  validateAddressCreation,
  checkAddressLimit,
  validateDefaultAddressLogic,
  createAddress
);

// GET /api/addresses - Get all addresses for authenticated user
router.get(
  '/',
  getUserAddresses
);

// GET /api/addresses/stats - Get address statistics for user
router.get(
  '/stats',
  getAddressStats
);

// GET /api/addresses/debug - Debug endpoint to check address status
router.get(
  '/debug',
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await checkUserAddressStatus(userId);
      
      res.status(200).json({
        success: true,
        message: 'Address status retrieved',
        data: {
          userId,
          status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking address status',
        error: error.message
      });
    }
  }
);

// GET /api/addresses/default - Get user's default address
router.get(
  '/default',
  getDefaultAddress
);

// GET /api/addresses/:id - Get a specific address by ID
router.get(
  '/:id',
  validateAddressId,
  checkAddressOwnership,
  getAddressById
);

// PUT /api/addresses/:id - Update an address
router.put(
  '/:id',
  validateAddressId,
  checkAddressOwnership,
  sanitizeAddressData,
  validateAddressUpdate,
  validateDefaultAddressLogic,
  updateAddress
);

// PATCH /api/addresses/:id/default - Set an address as default
router.patch(
  '/:id/default',
  validateAddressId,
  checkAddressOwnership,
  setDefaultAddress
);

// DELETE /api/addresses/:id - Soft delete an address
router.delete(
  '/:id',
  validateAddressId,
  checkAddressOwnership,
  deleteAddress
);

// POST /api/addresses/:id/restore - Restore a soft-deleted address
router.post(
  '/:id/restore',
  validateAddressId,
  restoreAddress
);

// DELETE /api/addresses/:id/permanent - Permanently delete an address
router.delete(
  '/:id/permanent',
  validateAddressId,
  permanentlyDeleteAddress
);

export default router;
