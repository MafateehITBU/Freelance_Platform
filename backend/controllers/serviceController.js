import Service from "../models/Service.js";
import Category from "../models/Category.js";
import SubCategory from "../models/Subcategory.js";
import Freelancer from "../models/Freelancer.js";
import AddOn from "../models/AddOn.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";


/**-------------------------------------
 * @desc Add a new service
 * @route POST /api/service
 * @access Private
 * @role Freelancer
 *---------------------------------------*/
export const addService = async (req, res) => {
    try {
        const { title, description, price, categoryId, subCategoryId, expectedDeliveryTime, keywords, addOn } = req.body;
        const freelancerId = req.user.id;

        // Validate required fields
        if (!title || !description || !price || !categoryId || !subCategoryId || !expectedDeliveryTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if category and subcategory exist
        const category = await Category.findById(categoryId);
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!category || !subCategory) {
            return res.status(404).json({ message: "Category or Subcategory not found" });
        }

        // Check if freelancer exists
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        // Handle images upload
        let images = [];
        if (req.files && req.files.images && req.files.images.length > 0) {
            for (const file of req.files.images) {
                const imageUrl = await uploadToCloudinary(file.path, 'services');
                if (imageUrl) {
                    images.push(imageUrl);
                } else {
                    images.push(null);
                }
            }
        }

        // Parse addOns
        let parsedAddOns = [];
        if (addOn) {
            try {
                parsedAddOns = JSON.parse(addOn);
                if (!Array.isArray(parsedAddOns)) {
                    return res.status(400).json({ message: "Add Ons must be an array." });
                }
            } catch (err) {
                return res.status(400).json({ message: "Invalid JSON format for addOn." });
            }
        }

        // Create add-ons if provided
        let addOnIds = [];
        if (parsedAddOns && parsedAddOns.length > 0) {
            for (const addOnData of parsedAddOns) {
                const newAddOn = new AddOn({
                    title: addOnData.title,
                    duration: addOnData.duration,
                    price: addOnData.price,
                });
                const savedAddOn = await newAddOn.save();
                addOnIds.push(savedAddOn._id);
            }
        }

        // Create new service
        const service = new Service({
            title,
            description,
            price,
            category: categoryId,
            subCategory: subCategoryId,
            images,
            keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
            freelancer: freelancerId,
            expectedDeliveryTime,
            addOn: addOnIds,
        });

        const savedService = await service.save();
        res.status(201).json({
            message: "Service created successfully",
            service: savedService
        });
    } catch (error) {
        console.error("Error adding service:", error);
        res.status(500).json({
            message: "Failed to create service",
            error: error.message
        });
    }
}

/**-------------------------------------
 * @desc Get all services
 * @route GET /api/service/all
 * @access Public
 *---------------------------------------*/
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('freelancer', 'name profilePicture')
            .populate('addOn');
        res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({
            message: "Failed to fetch services",
            error: error.message
        });
    }
}

/**-------------------------------------
 * @desc Get all services for a freelancer
 * @route GET /api/service
 * @access Public
 *---------------------------------------*/
export const getAllFreelancerServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('freelancer', 'name profilePicture')
            .populate('addOn');

        res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({
            message: "Failed to fetch services",
            error: error.message
        });
    }
}

/**-------------------------------------
 * @desc Get all services grouped by category
 * @route GET /api/service/category
 * @access Public
 * ---------------------------------------*/
export const getServicesByCategory = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('freelancer', 'name profilePicture')
            .populate('addOn');

        // Group services by category
        const groupedServices = services.reduce((acc, service) => {
            const categoryName = service.category.name;
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(service);
            return acc;
        }, {});

        res.status(200).json(groupedServices);
    } catch (error) {
        console.error("Error fetching services by category:", error);
        res.status(500).json({
            message: "Failed to fetch services by category",
            error: error.message
        });
    }
}

/** -------------------------------------
 * @desc Get all services grouped by subcategory
 * @route GET /api/service/subcategory
 * @access Public
 ---------------------------------------*/
export const getServicesBySubCategory = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('freelancer', 'name profilePicture')
            .populate('addOn');

        // Group services by category
        const groupedServices = services.reduce((acc, service) => {
            const subcategoryName = service.subCategory.name;
            if (!acc[subcategoryName]) {
                acc[subcategoryName] = [];
            }
            acc[subcategoryName].push(service);
            return acc;
        }, {});

        res.status(200).json(groupedServices);
    } catch (error) {
        console.error("Error fetching services by subcategory:", error);
        res.status(500).json({
            message: "Failed to fetch services by subcategory",
            error: error.message
        });
    }
}

/**-----------------------------------------
 *  @desc Toggle approve status of a service
 * @route PUT /api/service/:id/approve
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const toggleServiceApprove = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if freelancer exists
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Toggle verification status
        service.approved = !service.approved;
        await service.save();

        res.status(200).json({
            message: `Service ${service.approved ? 'approved' : 'not approved'}`,
            service
        });
    } catch (error) {
        console.error("Error toggling verification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/** -------------------------------------
 * @desc Update a Service
 * @route PUT /api/service/:serviceId
 * @access Private
 * @role  Freelancer
 ---------------------------------------*/
export const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const freelancerId = req.user.id;

        const {
            title,
            description,
            price,
            categoryId,
            subCategoryId,
            expectedDeliveryTime,
            keywords,
            removedImages,
        } = req.body;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.freelancer.toString() !== freelancerId) {
            return res.status(403).json({ message: "Unauthorized to update this service" });
        }

        // Update fields if provided
        if (title) service.title = title;
        if (description) service.description = description;
        if (price) service.price = price;
        if (categoryId) service.category = categoryId;
        if (subCategoryId) service.subCategory = subCategoryId;
        if (expectedDeliveryTime) service.expectedDeliveryTime = expectedDeliveryTime;
        if (keywords) {
            service.keywords = keywords.split(',').map(k => k.trim());
        }

        // Handle image deletions
        let removed = [];

        if (removedImages) {
            try {
                removed = Array.isArray(removedImages)
                    ? removedImages
                    : JSON.parse(removedImages);
            } catch (err) {
                removed = [removedImages]; // fallback for single string
            }

            for (const imageUrl of removed) {
                await deleteFromCloudinary(imageUrl, 'services');
                service.images = service.images.filter(img => img !== imageUrl);
            }
        }

        // Handle new image uploads
        if (req.files && req.files.images && req.files.images.length > 0) {
            for (const file of req.files.images) {
                const imageUrl = await uploadToCloudinary(file.path, 'services');
                if (imageUrl) {
                    service.images.push(imageUrl);
                }
            }
        }

        const updatedService = await service.save();
        res.status(200).json({
            message: "Service updated successfully",
            service: updatedService,
        });

    } catch (error) {
        console.error("Error updating the service:", error);
        res.status(500).json({
            message: "Failed to update the service",
            error: error.message,
        });
    }
};

/** -------------------------------------
 * @desc Delete a Service
 * @route DELETE /api/service/:serviceId
 * @access Private
 * @role  Freelancer, Admin
 ---------------------------------------*/
export const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const freelancerId = req.user.id;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Authorization check: freelancer who owns it or admin
        if (service.freelancer.toString() !== freelancerId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized to delete this service" });
        }

        // Delete images from Cloudinary
        if (Array.isArray(service.images)) {
            for (const imageUrl of service.images) {
                await deleteFromCloudinary(imageUrl, 'services');
            }
        }

        // Delete associated add-ons
        if (Array.isArray(service.addOn) && service.addOn.length > 0) {
            await AddOn.deleteMany({ _id: { $in: service.addOn } });
        }

        // Delete the service
        await service.deleteOne();

        res.status(200).json({ message: "Service deleted successfully" });

    } catch (error) {
        console.error("Error deleting the service:", error);
        res.status(500).json({
            message: "Failed to delete the service",
            error: error.message,
        });
    }
};
