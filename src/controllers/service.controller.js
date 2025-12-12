import Service from '../models/service.model.js';

// Create a new service (Admin only)
export const createService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const service = new Service(serviceData);
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

// Get all services with filtering and pagination
export const getAllServices = async (req, res) => {
  try {
    const { filters, pagination } = req;
    
    const query = Service.find(filters);
    
    // Apply pagination
    const services = await query
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
    // Get total count for pagination
    const total = await Service.countDocuments(filters);
    const totalPages = Math.ceil(total / pagination.limit);
    
    res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      data: {
        services,
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalServices: total,
          hasNextPage: pagination.page < totalPages,
          hasPrevPage: pagination.page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving services',
      error: error.message
    });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service retrieved successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving service',
      error: error.message
    });
  }
};

// Update service (Admin only)
export const updateService = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const service = await Service.findByIdAndUpdate(
      req.params.serviceId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
};

// Delete service (Admin only)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: {
        deletedService: {
          id: service._id,
          name: service.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
};

// Get services by category
export const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const services = await Service.findByCategory(category);
    
    res.status(200).json({
      success: true,
      message: `Services in ${category} category retrieved successfully`,
      data: {
        category,
        services,
        count: services.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving services by category',
      error: error.message
    });
  }
};

// Get popular services
export const getPopularServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const services = await Service.findPopularServices(limit);
    
    res.status(200).json({
      success: true,
      message: 'Popular services retrieved successfully',
      data: {
        services,
        count: services.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving popular services',
      error: error.message
    });
  }
};

// Toggle service availability (Admin only)
export const toggleServiceAvailability = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await service.toggleAvailability();
    
    res.status(200).json({
      success: true,
      message: 'Service availability toggled successfully',
      data: {
        service: {
          id: service._id,
          name: service.name,
          isAvailable: service.isAvailable
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling service availability',
      error: error.message
    });
  }
};

// Increment service popularity (when service is viewed/selected)
export const incrementServicePopularity = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await service.incrementPopularity();
    
    res.status(200).json({
      success: true,
      message: 'Service popularity incremented successfully',
      data: {
        service: {
          id: service._id,
          name: service.name,
          popularity: service.popularity
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error incrementing service popularity',
      error: error.message
    });
  }
};

// Bulk update services (Admin only)
export const bulkUpdateServices = async (req, res) => {
  try {
    const { services } = req.body;
    
    if (!Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'Services must be an array'
      });
    }
    
    const updatePromises = services.map(async (serviceData) => {
      const { id, ...updateData } = serviceData;
      return Service.findByIdAndUpdate(
        id,
        { ...updateData, updatedBy: req.user.id },
        { new: true, runValidators: true }
      );
    });
    
    const updatedServices = await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Services updated successfully',
      data: {
        updatedServices,
        count: updatedServices.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk updating services',
      error: error.message
    });
  }
};

// Get service statistics (Admin only)
export const getServiceStatistics = async (req, res) => {
  try {
    const stats = await Service.aggregate([
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          availableServices: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalPopularity: { $sum: '$popularity' }
        }
      }
    ]);
    
    const categoryStats = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Service statistics retrieved successfully',
      data: {
        overall: stats[0] || {
          totalServices: 0,
          activeServices: 0,
          availableServices: 0,
          averagePrice: 0,
          totalPopularity: 0
        },
        byCategory: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving service statistics',
      error: error.message
    });
  }
};
