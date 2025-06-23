import SubCategory from "../models/Subcategory.js";
import Category from "../models/Category.js";

/**-------------------------------------
 * @desc Add a new subcategory
 * @route POST /api/subcategory
 * @access Private
 * @role Admin
 ---------------------------------------*/
export const addSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        // Check if category exists
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        // Create new subcategory
        const subcategory = new SubCategory({
            name,
            category: categoryId
        });
        const savedSubCategory = await subcategory.save();
        res.status(201).json({
            message: "Subcategory created successfully",
            subcategory: savedSubCategory
        });
    } catch (error) {
        console.error("Error adding subcategory:", error);
        res.status(500).json({
            message: "Failed to create subcategory",
            error: error.message
        });
    }
};

/**-------------------------------------
 * @desc Get all subcategories grouped by category
 * @route GET /api/subcategory
 * @access Public
 ---------------------------------------*/
export const getAllSubCategories = async (req, res) => {
    try {
        const subcategories = await SubCategory.find().populate('category', 'name');
        const groupedSubCategories = subcategories.reduce((acc, subcategory) => {
            const categoryName = subcategory.category.name;
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(subcategory);
            return acc;
        }, {});

        res.status(200).json(groupedSubCategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({
            message: "Failed to fetch subcategories",
            error: error.message
        });
    }
}

/**-------------------------------------
 * @desc Get subcategories by category ID
 * @route GET /api/subcategory/:categoryId
 * @access Public
 ---------------------------------------*/
export const getSubCategoriesByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await SubCategory.find({ category: categoryId }).populate('category', 'name');
        if (subcategories.length === 0) {
            return res.status(404).json({ message: "No subcategories found for this category" });
        }
        res.status(200).json(subcategories);
    } catch (error) {
        console.error("Error fetching subcategories by category ID:", error);
        res.status(500).json({
            message: "Failed to fetch subcategories by category ID",
            error: error.message
        });
    }
}

/**-------------------------------------
 * @desc Update a subcategory
 * @route PUT /api/subcategory/:subcategoryId
 * @access Private
 * @role Admin
 * ---------------------------------------*/
export const updateSubCategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const { name, categoryId } = req.body;

        // Check if subcategory exists
        const existingSubCategory = await SubCategory.findById(subcategoryId);
        if (!existingSubCategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        // Update only the provided fields
        if (name) existingSubCategory.name = name;
        if (categoryId) {
            // Check if category exists
            const existingCategory = await Category.findById(categoryId);
            if (!existingCategory) {
                return res.status(404).json({ message: "Category not found" });
            }
            
            existingSubCategory.category = categoryId;
        }
        const updatedSubCategory = await existingSubCategory.save();
        res.status(200).json({
            message: "Subcategory updated successfully",
            subcategory: updatedSubCategory
        });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).json({
            message: "Failed to update subcategory",
            error: error.message
        });
    }
};

/**----------------------------------
 * @desc Delete a subcategory
 * @route DELETE /api/subcategory/:subcategoryId
 * @access Private
 * @role Admin
 ------------------------------------*/
export const deleteSubCategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        // Check if subcategory exists
        const existingSubCategory = await SubCategory.findById(subcategoryId);
        if (!existingSubCategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        // Delete the subcategory
        await SubCategory.findByIdAndDelete(subcategoryId);
        res.status(200).json({
            message: "Subcategory deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        res.status(500).json({
            message: "Failed to delete subcategory",
            error: error.message
        });
    }
}