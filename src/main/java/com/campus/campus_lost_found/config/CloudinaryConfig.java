
package com.campus.campus_lost_found.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {

        Map<String, Object> config = new HashMap<>();

        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        config.put("secure", true);

        return new Cloudinary(config);
    }

    public boolean isConfigured() {
        return isConfiguredValue(cloudName)
                && isConfiguredValue(apiKey)
                && isConfiguredValue(apiSecret);
    }

    private boolean isConfiguredValue(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = value.trim().toLowerCase();
        return !normalized.startsWith("your_")
                && !normalized.contains("placeholder")
                && !normalized.equals("change_me")
                && !normalized.equals("example");
    }
}
