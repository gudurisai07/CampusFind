package com.campus.campus_lost_found.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.campus.campus_lost_found.storage.CloudinaryUploadException;

@RestControllerAdvice
public class CloudinaryUploadExceptionHandler {

    @ExceptionHandler(CloudinaryUploadException.class)
    public ResponseEntity<Map<String, String>> handleCloudinaryUploadException(
            CloudinaryUploadException exception) {

        return ResponseEntity
                .status(exception.getStatus())
                .body(Map.of(
                        "status", String.valueOf(exception.getStatus().value()),
                        "error", exception.getStatus().getReasonPhrase(),
                        "message", exception.getMessage()
                ));
    }
}
