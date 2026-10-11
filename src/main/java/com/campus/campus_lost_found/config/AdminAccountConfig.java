package com.campus.campus_lost_found.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.campus.campus_lost_found.Entity.User;
import com.campus.campus_lost_found.Repository.UserRepository;

@Configuration
public class AdminAccountConfig {

    @Bean
    CommandLineRunner createAdminAccount(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@campus.local";

            if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {

                User admin = new User();

                admin.setFullName("Campus Administrator");
                admin.setEmail(adminEmail);
                admin.setPasswordHash(
                        passwordEncoder.encode("admin"));
                admin.setRole("ADMIN");

                userRepository.save(admin);

                System.out.println(
                        "CampusFind admin account created successfully.");
            }
        };
    }
}
