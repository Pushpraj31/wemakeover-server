import express from 'express';
import {
  saveCart,
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
  getCartSummary,
  restoreCart,
  getCartStatistics,
  exportCartData
} from '../controllers/cart.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  validateCartItem,
  validateCartUpdate,
  checkCartExists,
  getOrCreateCart,
  sanitizeCartData,
  calculateCartTotals,
  checkCartLimits,
  validateServiceIdFormat
} from '../middlewares/cart.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Cart CRUD operations
router.get('/', getOrCreateCart, getCart);
router.post('/save', sanitizeCartData, validateCartUpdate, calculateCartTotals, checkCartLimits, saveCart);
router.post('/restore', sanitizeCartData, validateCartUpdate, calculateCartTotals, checkCartLimits, restoreCart);
router.get('/summary', getOrCreateCart, getCartSummary);

// Item operations
router.post(
  '/add-item',
  getOrCreateCart,
  sanitizeCartData,
  validateCartItem,
  validateServiceIdFormat,
  addItemToCart
);

router.patch(
  '/item/:serviceId/quantity',
  getOrCreateCart,
  updateItemQuantity
);

router.delete(
  '/item/:serviceId',
  getOrCreateCart,
  removeItemFromCart
);

router.delete(
  '/clear',
  getOrCreateCart,
  clearCart
);

// Export cart data
router.get('/export', getOrCreateCart, exportCartData);

// Admin routes
router.get(
  '/admin/statistics',
  requireAdmin,
  getCartStatistics
);

export default router;
