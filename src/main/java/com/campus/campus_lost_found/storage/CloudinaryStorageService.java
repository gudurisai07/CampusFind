
package com.campus.campus_lost_found.storage;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.campus.campus_lost_found.config.CloudinaryConfig;

@Service
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;
    private final CloudinaryConfig cloudinaryConfig;

    public CloudinaryStorageService(
            Cloudinary cloudinary,
            CloudinaryConfig cloudinaryConfig) {
        this.cloudinary = cloudinary;
        this.cloudinaryConfig = cloudinaryConfig;
    }

    public Map<String, Object> uploadImage(MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image file.");
        }

        String contentType = file.getContentType();

        if (contentType == null
                || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Only image files are allowed.");
        }

        if (!cloudinaryConfig.isConfigured()) {
            throw new CloudinaryUploadException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Image upload is not configured. Set real "
                            + "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, "
                            + "and CLOUDINARY_API_SECRET values in the "
                            + "project root .env file, then restart the app.");
        }

        Map<?, ?> uploadResult;
        try {
            uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "campus-lost-found"
                    )
            );
        } catch (RuntimeException exception) {
            if (exception.getMessage() != null
                    && exception.getMessage().contains("Unknown API key")) {
                throw new CloudinaryUploadException(
                        HttpStatus.BAD_GATEWAY,
                        "Cloudinary rejected the API key. Check the "
                                + "Cloudinary credentials in the project "
                                + "root .env file and restart the app.");
            }

            throw exception;
        }

        Map<String, Object> response = new HashMap<>();

        response.put("imageUrl", uploadResult.get("secure_url"));
        response.put("imagePublicId", uploadResult.get("public_id"));

        return response;
    }
}
