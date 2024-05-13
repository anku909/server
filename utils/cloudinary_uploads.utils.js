import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (stream) => {
  try {
    // Check if stream is provided
    if (!stream) {
      throw new Error("No stream provided for upload");
    }

    // Upload the stream to Cloudinary
    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.pipe(uploadStream);
    });

    // Log the uploaded file URL
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    throw new Error("File upload failed");
  }
};
export { uploadOnCloudinary };
