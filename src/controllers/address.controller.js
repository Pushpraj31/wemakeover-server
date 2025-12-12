import Address from '../models/address.model.js';

// Create a new address
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      houseFlatNumber,
      streetAreaName,
      completeAddress,
      landmark,
      pincode,
      city,
      state,
      country,
      phone,
      addressType,
      isDefault
    } = req.body;

    // Check if user has any existing addresses and if there's a default address
    const existingAddressCount = await Address.countDocuments({
      user: userId,
      isActive: true
    });

    const hasDefaultAddress = await Address.findOne({
      user: userId,
      isDefault: true,
      isActive: true
    });

    // Auto-default logic: Set as default if:
    // 1. This is the first address (existingAddressCount === 0)
    // 2. User explicitly wants it as default (isDefault === true)
    // 3. No default address exists (hasDefaultAddress === null)
    const shouldBeDefault = existingAddressCount === 0 || isDefault === true || !hasDefaultAddress;

    // Validate phone number format (additional server-side validation)
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6-9'
      });
    }

    // Create new address
    const newAddress = new Address({
      user: userId,
      houseFlatNumber,
      streetAreaName,
      completeAddress,
      landmark,
      pincode,
      city,
      state,
      country,
      phone,
      addressType,
      isDefault: shouldBeDefault
    });

    const savedAddress = await newAddress.save();

    // Log the logic for debugging
    console.log(`Address created for user ${userId}:`, {
      isFirstAddress: existingAddressCount === 0,
      hasExistingDefault: !!hasDefaultAddress,
      isDefault: shouldBeDefault,
      userSpecifiedDefault: isDefault,
      hasPhone: !!phone,
      phoneNumber: phone ? `${phone.slice(0, 2)}****${phone.slice(-2)}` : 'N/A', // Masked for logs
      autoDefaultReason: existingAddressCount === 0 ? 'first_address' : 
                        !hasDefaultAddress ? 'no_default_exists' : 
                        isDefault === true ? 'user_specified' : 'none'
    });

    // Determine response message
    let message = 'Address created successfully';
    if (shouldBeDefault) {
      if (existingAddressCount === 0) {
        message = 'Address created successfully and set as default (first address)';
      } else if (!hasDefaultAddress) {
        message = 'Address created successfully and set as default (no default address existed)';
      } else if (isDefault === true) {
        message = 'Address created successfully and set as default (user specified)';
      }
    }

    res.status(201).json({
      success: true,
      message,
      data: {
        address: savedAddress.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating address',
      error: error.message
    });
  }
};

// Get all addresses for authenticated user
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { includeInactive } = req.query;

    const addresses = await Address.findByUser(userId, includeInactive === 'true');

    if (addresses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No addresses found',
        data: {
          addresses: [],
          count: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: {
        addresses: addresses.map(address => address.toSafeObject()),
        count: addresses.length
      }
    });
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving addresses',
      error: error.message
    });
  }
};

// Get a specific address by ID
export const getAddressById = async (req, res) => {
  try {
    const address = req.address; // From checkAddressOwnership middleware

    res.status(200).json({
      success: true,
      message: 'Address retrieved successfully',
      data: {
        address: address.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Get address by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving address',
      error: error.message
    });
  }
};

// Get user's default address
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultAddress = await Address.findDefaultByUser(userId);

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default address retrieved successfully',
      data: {
        address: defaultAddress.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving default address',
      error: error.message
    });
  }
};

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    // Validate phone number if provided
    if (updateData.phone && !/^[6-9]\d{9}$/.test(updateData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6-9'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData._id;
    delete updateData.createdAt;

    // Add updatedAt
    updateData.updatedAt = new Date();

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, user: userId, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or does not belong to you'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: updatedAddress.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      error: error.message
    });
  }
};

// Set an address as default
export const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    // Use the static method from the model
    await Address.setDefaultAddress(userId, addressId);

    // Get the updated address
    const updatedAddress = await Address.findById(addressId);

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: {
        address: updatedAddress.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Set default address error:', error);
    
    if (error.message === 'Address not found or does not belong to user') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error setting default address',
      error: error.message
    });
  }
};

// Soft delete an address (set isActive to false)
export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    // Check if this is the default address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or does not belong to you'
      });
    }

    // If it's the default address, simply remove default status (no fallback)
    if (address.isDefault) {
      console.log(`🗑️ Deleting default address ${addressId} for user ${userId}`);
      console.log(`⚠️ No fallback address will be set. User must select new default during booking.`);
    }

    // Soft delete the address
    const deletedAddress = await Address.findByIdAndUpdate(
      addressId,
      { 
        isActive: false, 
        isDefault: false,
        updatedAt: new Date() 
      },
      { new: true }
    );

    // Determine response message based on what happened
    let message = 'Address deleted successfully';
    if (address.isDefault) {
      message = 'Default address deleted successfully. You will be asked to select an address during booking.';
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        address: deletedAddress.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address',
      error: error.message
    });
  }
};

// Permanently delete an address (hard delete)
export const permanentlyDeleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    const address = await Address.findOne({
      _id: addressId,
      user: userId,
      isActive: false // Only allow permanent deletion of soft-deleted addresses
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or already active'
      });
    }

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({
      success: true,
      message: 'Address permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting address',
      error: error.message
    });
  }
};

// Restore a soft-deleted address
export const restoreAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    const address = await Address.findOne({
      _id: addressId,
      user: userId,
      isActive: false
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or already active'
      });
    }

    // Check if user has reached address limit
    const activeAddressCount = await Address.countDocuments({
      user: userId,
      isActive: true
    });

    if (activeAddressCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum address limit reached. Cannot restore this address.'
      });
    }

    const restoredAddress = await Address.findByIdAndUpdate(
      addressId,
      { 
        isActive: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Address restored successfully',
      data: {
        address: restoredAddress.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Restore address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring address',
      error: error.message
    });
  }
};

// Get address statistics for user
export const getAddressStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Address.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: null,
          totalAddresses: { $sum: 1 },
          activeAddresses: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          defaultAddresses: {
            $sum: { $cond: [{ $eq: ['$isDefault', true] }, 1, 0] }
          },
          homeAddresses: {
            $sum: { $cond: [{ $eq: ['$addressType', 'home'] }, 1, 0] }
          },
          officeAddresses: {
            $sum: { $cond: [{ $eq: ['$addressType', 'office'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAddresses: 0,
      activeAddresses: 0,
      defaultAddresses: 0,
      homeAddresses: 0,
      officeAddresses: 0
    };

    res.status(200).json({
      success: true,
      message: 'Address statistics retrieved successfully',
      data: {
        statistics: result
      }
    });
  } catch (error) {
    console.error('Get address stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving address statistics',
      error: error.message
    });
  }
};

// Helper function to check user's address status (for debugging)
export const checkUserAddressStatus = async (userId) => {
  try {
    const activeAddresses = await Address.find({
      user: userId,
      isActive: true
    }).sort({ createdAt: -1 });

    const defaultAddress = await Address.findOne({
      user: userId,
      isDefault: true,
      isActive: true
    });

    return {
      totalActiveAddresses: activeAddresses.length,
      hasDefaultAddress: !!defaultAddress,
      defaultAddressId: defaultAddress?._id,
      addresses: activeAddresses.map(addr => ({
        id: addr._id,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt
      }))
    };
  } catch (error) {
    console.error('Error checking user address status:', error);
    return null;
  }
};
