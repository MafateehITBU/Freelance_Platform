import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to local file
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} resourceType - 'image', 'video', 'raw' (for PDFs)
 */
export const uploadToCloudinary = async (filePath, folder = "uploads", resourceType = "auto") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
      unique_filename: true,
      resource_type: resourceType,
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    // Delete local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload to Cloudinary");
  }
};

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} imageUrl - The Cloudinary URL
 * @param {string} folder - Folder name (optional for scoped deletion)
 */
export const deleteFromCloudinary = async (imageUrl, folder = "uploads") => {
  try {
    const fileName = imageUrl?.split("/").pop()?.split(".")[0];
    const publicId = `${folder}/${fileName}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};