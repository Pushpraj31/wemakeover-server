import Cart from '../models/cart.model.js';

// Save cart data to database
export const saveCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    
    console.log('🛒 Backend - saveCart called:', {
      userId,
      itemsCount: items ? items.length : 0,
      items: items ? items.map(item => ({ serviceId: item.serviceId, quantity: item.quantity })) : []
    });
    
    // Find existing cart or create new one
    let cart = await Cart.findByUser(userId);
    
    console.log('🛒 Backend - Cart found/created:', {
      cartExists: !!cart,
      existingItemsCount: cart ? cart.items.length : 0,
      cartId: cart ? cart._id : 'new'
    });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: items || [],
        summary: {
          totalServices: 0,
          totalItems: 0,
          subtotal: 0,
          taxAmount: 0,
          total: 0
        }
      });
    } else {
      // Replace cart items with new data (frontend data takes precedence)
      cart.items = items.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        subtotal: item.price * (item.quantity || 1),
        addedAt: item.addedAt || new Date(),
        lastModified: new Date()
      }));
    }
    
    console.log('🛒 Backend - Before save:', {
      itemsCount: cart.items.length,
      items: cart.items.map(item => ({ serviceId: item.serviceId, quantity: item.quantity }))
    });
    
    await cart.save();
    
    console.log('🛒 Backend - After save:', {
      cartId: cart._id,
      itemsCount: cart.items.length,
      summary: cart.summary,
      lastUpdated: cart.lastUpdated
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart saved successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving cart',
      error: error.message
    });
  }
};

// Get cart data from database
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findByUser(req.user.id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated,
          isExpired: cart.isExpired
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart',
      error: error.message
    });
  }
};

// Add item to cart
export const addItemToCart = async (req, res) => {
  try {
    const cart = req.cart;
    const itemData = req.body;
    
    await cart.addItem(itemData);
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

// Update item quantity in cart
export const updateItemQuantity = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { quantity } = req.body;
    
    const cart = req.cart;
    
    await cart.updateItemQuantity(serviceId, quantity);
    
    res.status(200).json({
      success: true,
      message: 'Item quantity updated successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating item quantity',
      error: error.message
    });
  }
};

// Remove item from cart
export const removeItemFromCart = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const cart = req.cart;
    
    await cart.removeItem(serviceId);
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = req.cart;
    
    await cart.clearCart();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

// Get cart summary
export const getCartSummary = async (req, res) => {
  try {
    const cart = req.cart;
    
    res.status(200).json({
      success: true,
      message: 'Cart summary retrieved successfully',
      data: {
        summary: cart.summary,
        itemCount: cart.items.length,
        isEmpty: cart.isEmpty(),
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart summary',
      error: error.message
    });
  }
};

// Restore cart from localStorage (sync with database)
export const restoreCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    
    // Find existing cart
    let cart = await Cart.findByUser(userId);
    
    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        user: userId,
        items: items || [],
        summary: {
          totalServices: 0,
          totalItems: 0,
          subtotal: 0,
          taxAmount: 0,
          total: 0
        }
      });
    } else {
      // Merge with existing cart (database takes precedence for conflicts)
      const existingServiceIds = new Set(cart.items.map(item => item.serviceId));
      
      // Add new items that don't exist in database
      items.forEach(item => {
        if (!existingServiceIds.has(item.serviceId)) {
          cart.items.push({
            ...item,
            quantity: item.quantity || 1,
            subtotal: item.price * (item.quantity || 1),
            addedAt: new Date(),
            lastModified: new Date()
          });
        }
      });
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart restored successfully',
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          summary: cart.summary,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error restoring cart',
      error: error.message
    });
  }
};

// Get cart statistics (Admin only)
export const getCartStatistics = async (req, res) => {
  try {
    const stats = await Cart.aggregate([
      {
        $group: {
          _id: null,
          totalCarts: { $sum: 1 },
          activeCarts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          totalItems: { $sum: '$summary.totalItems' },
          totalValue: { $sum: '$summary.total' },
          averageCartValue: { $avg: '$summary.total' }
        }
      }
    ]);
    
    const recentCarts = await Cart.find({ isActive: true })
      .sort({ lastUpdated: -1 })
      .limit(10)
      .populate('user', 'username email')
      .select('user summary.total summary.totalItems lastUpdated');
    
    res.status(200).json({
      success: true,
      message: 'Cart statistics retrieved successfully',
      data: {
        overall: stats[0] || {
          totalCarts: 0,
          activeCarts: 0,
          totalItems: 0,
          totalValue: 0,
          averageCartValue: 0
        },
        recentCarts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart statistics',
      error: error.message
    });
  }
};

// Export cart data (for backup/analytics)
export const exportCartData = async (req, res) => {
  try {
    const cart = req.cart;
    
    const exportData = {
      userId: cart.user,
      items: cart.items.map(item => ({
        serviceId: item.serviceId,
        name: item.cardHeader,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        category: item.category,
        addedAt: item.addedAt,
        lastModified: item.lastModified
      })),
      summary: cart.summary,
      lastUpdated: cart.lastUpdated,
      exportedAt: new Date()
    };
    
    res.status(200).json({
      success: true,
      message: 'Cart data exported successfully',
      data: exportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting cart data',
      error: error.message
    });
  }
};
