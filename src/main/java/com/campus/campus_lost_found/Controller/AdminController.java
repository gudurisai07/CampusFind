package com.campus.campus_lost_found.Controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campus.campus_lost_found.Entity.Item;
import com.campus.campus_lost_found.Entity.User;
import com.campus.campus_lost_found.Repository.ItemRepository;
import com.campus.campus_lost_found.Repository.UserRepository;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public AdminController(
            ItemRepository itemRepository,
            UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    // Check admin session before accessing admin APIs
    private ResponseEntity<?> checkAdmin(HttpSession session) {

        if (session == null ||
                session.getAttribute("userRole") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login first"));
        }

        if (!"ADMIN".equals(session.getAttribute("userRole"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Admin access required"));
        }

        return null;
    }

    // Dashboard statistics
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) return error;

        List<Item> items = itemRepository.findAll();

        long lost = items.stream()
                .filter(i -> "LOST".equalsIgnoreCase(i.getItemType()))
                .count();

        long found = items.stream()
                .filter(i -> "FOUND".equalsIgnoreCase(i.getItemType()))
                .count();

        long returned = items.stream()
                .filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus()))
                .count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalItems", items.size());
        stats.put("lostItems", lost);
        stats.put("foundItems", found);
        stats.put("returnedItems", returned);
        stats.put("activeItems", items.size() - returned);

        return ResponseEntity.ok(stats);
    }

    // List users without exposing their password hashes
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) return error;

        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(this::userToMap)
                .toList();

        return ResponseEntity.ok(users);
    }

    private Map<String, Object> userToMap(User user) {

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("fullName", user.getFullName());
        result.put("email", user.getEmail());
        result.put("role", user.getRole());
        result.put("createdAt", user.getCreatedAt());

        return result;
    }

    // List items for the admin
    @GetMapping("/items")
    public ResponseEntity<?> getItems(HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) return error;

        List<Map<String, Object>> items = itemRepository.findAll()
                .stream()
                .map(this::itemToMap)
                .toList();

        return ResponseEntity.ok(items);
    }

    private Map<String, Object> itemToMap(Item item) {

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", item.getId());
        result.put("itemName", item.getItemName());
        result.put("itemType", item.getItemType());
        result.put("category", item.getCategory());
        result.put("color", item.getColor());
        result.put("location", item.getLocation());
        result.put("status", item.getStatus());
        result.put("contactName", item.getContactName());
        result.put("contactEmail", item.getContactEmail());
        result.put("imageUrl", item.getImageUrl());
        result.put("createdAt", item.getCreatedAt());

        return result;
    }

    // Update item status
    @PatchMapping("/items/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestBody StatusRequest request,
            HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) return error;

        if (request.status() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Status is required"));
        }

        String status = request.status()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!List.of("OPEN", "RETURNED", "CLOSED").contains(status)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Status must be OPEN, RETURNED or CLOSED"));
        }

        Item item = itemRepository.findById(id).orElse(null);

        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Item not found"));
        }

        item.setStatus(status);
        Item saved = itemRepository.save(item);

        return ResponseEntity.ok(itemToMap(saved));
    }

    // Delete an item report
    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(
            @PathVariable Integer id,
            HttpSession session) {

        ResponseEntity<?> error = checkAdmin(session);
        if (error != null) return error;

        if (!itemRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Item not found"));
        }

        itemRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of("message", "Item deleted successfully"));
    }

    public record StatusRequest(String status) {
    }
}
