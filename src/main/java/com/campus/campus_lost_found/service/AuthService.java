
package com.campus.campus_lost_found.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campus.campus_lost_found.Entity.User;
import com.campus.campus_lost_found.Repository.UserRepository;
import com.campus.campus_lost_found.dto.LoginRequest;
import com.campus.campus_lost_found.dto.RegisterRequest;
import com.campus.campus_lost_found.dto.UserResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Passwords do not match");
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        String studentId = request.getStudentId()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        if (userRepository.existsByStudentIdIgnoreCase(studentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Student ID is already registered");
        }

        User user = new User();

        user.setStudentId(studentId);
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setEducationLevel(request.getEducationLevel());
        user.setBranch(request.getBranch());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");

        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
    }

    public UserResponse login(LoginRequest request) {

        String loginId = request.getEmail().trim();
        String email;

        if (loginId.equalsIgnoreCase("admin")) {
            email = "admin@campus.local";
        } else {
            email = loginId.toLowerCase(Locale.ROOT);
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid username/email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username/email or password");
        }

        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getStudentId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getEducationLevel(),
                user.getBranch(),
                user.getRole(),
                user.getCreatedAt());
    }
}
