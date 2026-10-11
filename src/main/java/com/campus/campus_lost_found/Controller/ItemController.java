
package com.campus.campus_lost_found.Controller;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campus.campus_lost_found.Entity.Item;
import com.campus.campus_lost_found.service.ItemService;
import com.campus.campus_lost_found.storage.CloudinaryStorageService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;
    private final CloudinaryStorageService cloudinaryStorageService;

    public ItemController(
            ItemService itemService,
            CloudinaryStorageService cloudinaryStorageService) {

        this.itemService = itemService;
        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    // Check whether the user is logged in
    private ResponseEntity<?> checkLogin(HttpSession session) {

        if (session == null ||
                session.getAttribute("userRole") == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login first"));
        }

        return null;
    }

    // Public endpoint: send only image and filter information
    @GetMapping("/public")
    public ResponseEntity<List<Map<String, Object>>> getPublicItemImages() {

        List<Map<String, Object>> publicItems =
                itemService.getAllItems()
                        .stream()
                        .filter(item ->
                                item.getImageUrl() != null
                                && !item.getImageUrl().isBlank())
                        .filter(item ->
                                !"RETURNED".equalsIgnoreCase(item.getStatus())
                                && !"CLOSED".equalsIgnoreCase(item.getStatus()))
                        .map(item -> {
                            Map<String, Object> image =
                                    new LinkedHashMap<>();

                            image.put("id", item.getId());
                            image.put("imageUrl", item.getImageUrl());
                            image.put("itemType", item.getItemType());

                            return image;
                        })
                        .toList();

        return ResponseEntity.ok(publicItems);
    }

    // All item details: login required
    @GetMapping
    public ResponseEntity<?> getAllItems(HttpSession session) {

        ResponseEntity<?> error = checkLogin(session);
        if (error != null) {
            return error;
        }

        return ResponseEntity.ok(itemService.getAllItems());
    }

    // One item's details: login required
    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(
            @PathVariable Integer id,
            HttpSession session) {

        ResponseEntity<?> error = checkLogin(session);
        if (error != null) {
            return error;
        }

        try {
            return ResponseEntity.ok(itemService.getItemById(id));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Item not found"));
        }
    }

    // Create item using JSON
    @PostMapping
    public ResponseEntity<?> createItem(
            @RequestBody Item item,
            HttpSession session) {

        ResponseEntity<?> error = checkLogin(session);
        if (error != null) {
            return error;
        }

        Item created = itemService.createItem(item);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // Create item and upload its image
    @PostMapping(
            value = "/with-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createItemWithImage(
            @ModelAttribute Item item,
            @RequestParam("image") MultipartFile image,
            HttpSession session) throws IOException {

        ResponseEntity<?> error = checkLogin(session);
        if (error != null) {
            return error;
        }

        Map<String, Object> uploadedImage =
                cloudinaryStorageService.uploadImage(image);

        item.setImageUrl(
                (String) uploadedImage.get("imageUrl"));

        item.setImagePublicId(
                (String) uploadedImage.get("imagePublicId"));

        Item created = itemService.createItem(item);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // Update an item: admin only
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(
            @PathVariable Integer id,
            @RequestBody Item item,
            HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) {
            return error;
        }

        try {
            return ResponseEntity.ok(
                    itemService.updateItem(id, item));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Item not found"));
        }
    }

    // Delete an item: admin only
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(
            @PathVariable Integer id,
            HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) {
            return error;
        }

        try {
            itemService.getItemById(id);
            itemService.deleteItem(id);

            return ResponseEntity.ok(
                    Map.of("message", "Item deleted successfully"));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Item not found"));
        }
    }

    private ResponseEntity<?> checkAdmin(HttpSession session) {

        ResponseEntity<?> error = checkLogin(session);
        if (error != null) {
            return error;
        }

        if (!"ADMIN".equals(session.getAttribute("userRole"))) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Admin access required"));
        }

        return null;
    }
}
