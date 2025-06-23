import AddOn from "../models/AddOn.js";
import Freelancer from "../models/Freelancer.js";
import Service from "../models/Service.js";

/**-------------------------------------
 * @desc Add a new add on to a service
 * @route POST /api/add-on
 * @access Private
 * @role Freelancer
 *---------------------------------------*/
export const createAddOn = async (req, res) => {
    try {
        const { title, price, duration, serviceId } = req.body;
        const freelancerId = req.user.id;

        if (!title || !price || !duration || !serviceId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.freelancer.toString() !== freelancerId) {
            return res.status(403).json({ message: "Unauthorized to add add-ons to this service." });
        }

        const addOn = new AddOn({ title, price, duration });
        const createdAddOn = await addOn.save();

        service.addOn.push(createdAddOn._id);
        await service.save();

        res.status(201).json({ message: "Add-on created successfully", addOn: createdAddOn });
    } catch (error) {
        console.error("Error creating an add-on:", error);
        res.status(500).json({ message: "Failed to create add-on", error: error.message });
    }
};

/**-------------------------------------
 * @desc Get all add-ons for a service
 * @route GET /api/add-on/:serviceId
 * @access Public
 *---------------------------------------*/
export const getAddOnsByService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId).populate("addOn");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(service.addOn);
    } catch (error) {
        console.error("Error fetching add-ons:", error);
        res.status(500).json({ message: "Failed to fetch add-ons", error: error.message });
    }
};

/**-------------------------------------
 * @desc Update an add-on
 * @route PUT /api/add-on/:addOnId
 * @access Private
 * @role Freelancer
 *---------------------------------------*/
export const updateAddOn = async (req, res) => {
    try {
        const { title, price, duration, serviceId } = req.body;
        const addOnId = req.params.addOnId;
        const freelancerId = req.user.id;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const addOn = await AddOn.findById(addOnId);
        if (!addOn) {
            return res.status(404).json({ message: "Add-on not found" });
        }

        if (service.freelancer.toString() !== freelancerId) {
            return res.status(403).json({ message: "Unauthorized to add add-ons to this service." });
        }

        if (title) addOn.title = title;
        if (price) addOn.price = price;
        if (duration) addOn.duration = duration;

        const updated = await addOn.save();
        res.status(200).json({ message: "Add-on updated successfully", addOn: updated });
    } catch (error) {
        console.error("Error updating add-on:", error);
        res.status(500).json({ message: "Failed to update add-on", error: error.message });
    }
};

/**-------------------------------------
 * @desc Delete an add-on
 * @route DELETE /api/add-on/:addOnId
 * @access Private
 * @role Freelancer
 *---------------------------------------*/
export const deleteAddOn = async (req, res) => {
    try {
        const addOnId = req.params.addOnId;
        const freelancerId = req.user.id;
        const { serviceId } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.freelancer.toString() !== freelancerId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized to delete add-ons from this service." });
        }

        const addOn = await AddOn.findById(addOnId);
        if (!addOn) {
            return res.status(404).json({ message: "Add-on not found" });
        }

        // Remove addOnId from the service's addOn array
        service.addOn = service.addOn.filter(id => id.toString() !== addOnId);
        await service.save();

        // Delete the add-on
        await addOn.deleteOne();

        res.status(200).json({ message: "Add-on deleted successfully" });
    } catch (error) {
        console.error("Error deleting add-on:", error);
        res.status(500).json({ message: "Failed to delete add-on", error: error.message });
    }
};