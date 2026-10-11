
package com.campus.campus_lost_found.Controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campus.campus_lost_found.storage.CloudinaryStorageService;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final CloudinaryStorageService storageService;

    public ImageController(CloudinaryStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("image") MultipartFile image)
            throws IOException {

        Map<String, Object> result =
                storageService.uploadImage(image);

        return ResponseEntity.ok(result);
    }
}
