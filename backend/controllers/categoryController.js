import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

/**-----------------------------------------
 *  @desc  Add a new Category
 *  @route POST /api/category
 * @access Private
 * @role   Admin
 * ------------------------------------------*/
export const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate input
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        // Check if image is provided
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        // Upload image to Cloudinary
        const imageUrl = await uploadToCloudinary(req.file.path, 'categories');

        // Create new category
        const newCategory = new Category({
            name,
            description,
            image: imageUrl
        });

        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**-----------------------------------------
 *  @desc  Get all Categories
 *  @route GET /api/category
 * @access Public
 * ------------------------------------------*/
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ message: 'Categories retrieved successfully', categories });
    } catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**-----------------------------------------
 *  @desc  Get Category by ID
 *  @route GET /api/category/:id
 * @access Public
 * ------------------------------------------*/
export const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Validate category ID
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category retrieved successfully', category });
    } catch (error) {
        console.error('Error retrieving category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**-----------------------------------------
 *  @desc  Update Category by ID
 *  @route PUT /api/category/:id
 * @access Private
 * @role   Admin
 * ------------------------------------------*/
export const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description } = req.body;

        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Update only the provided fields
        if (name) category.name = name;
        if (description) category.description = description;

        // Check if a new image is provided
        if (req.file) {
            if (category.image && category.image.includes("cloudinary")) {
                await deleteFromCloudinary(category.image, "category-profiles");
            }
            // Upload new image to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file.path, 'categories');
            category.image = imageUrl;
        }

        await category.save();
        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**-----------------------------------------
 *  @desc  Delete Category by ID
 *  @route DELETE /api/category/:id
 * @access Private
 * @role   Admin
 * ------------------------------------------*/
export const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Validate category ID
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        // check if the category has subcategories and delete them
        const subcategories = await Subcategory.find({ categoryId });
        if (subcategories.length > 0) {
            await Subcategory.deleteMany({ categoryId });
            console.log(`Deleted ${subcategories.length} subcategories associated with category ID: ${categoryId}`);
        }

        // Find and delete the category
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}