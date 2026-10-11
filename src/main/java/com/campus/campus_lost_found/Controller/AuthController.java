
package com.campus.campus_lost_found.Controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campus.campus_lost_found.dto.LoginRequest;
import com.campus.campus_lost_found.dto.RegisterRequest;
import com.campus.campus_lost_found.dto.UserResponse;
import com.campus.campus_lost_found.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        UserResponse user = authService.login(request);

        HttpSession oldSession = httpRequest.getSession(false);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession session = httpRequest.getSession(true);

        session.setAttribute("userId", user.id());
        session.setAttribute("userName", user.fullName());
        session.setAttribute("userEmail", user.email());
        session.setAttribute("userRole", user.role());

        if (user.studentId() != null) {
            session.setAttribute("studentId", user.studentId());
        }
        if (user.phoneNumber() != null) {
            session.setAttribute("phoneNumber", user.phoneNumber());
        }
        if (user.educationLevel() != null) {
            session.setAttribute("educationLevel", user.educationLevel());
        }
        if (user.branch() != null) {
            session.setAttribute("branch", user.branch());
        }

        return ResponseEntity.ok(toMap(user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null ||
                session.getAttribute("userRole") == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login first"));
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", session.getAttribute("userId"));
        result.put("studentId", session.getAttribute("studentId"));
        result.put("fullName", session.getAttribute("userName"));
        result.put("email", session.getAttribute("userEmail"));
        result.put("phoneNumber", session.getAttribute("phoneNumber"));
        result.put("educationLevel", session.getAttribute("educationLevel"));
        result.put("branch", session.getAttribute("branch"));
        result.put("role", session.getAttribute("userRole"));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully"));
    }

    private Map<String, Object> toMap(UserResponse user) {

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", user.id());
        result.put("studentId", user.studentId());
        result.put("fullName", user.fullName());
        result.put("email", user.email());
        result.put("phoneNumber", user.phoneNumber());
        result.put("educationLevel", user.educationLevel());
        result.put("branch", user.branch());
        result.put("role", user.role());

        return result;
    }
}
