
package com.campus.campus_lost_found.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Integer id,
        String studentId,
        String fullName,
        String email,
        String phoneNumber,
        String educationLevel,
        String branch,
        String role,
        LocalDateTime createdAt) {
}
