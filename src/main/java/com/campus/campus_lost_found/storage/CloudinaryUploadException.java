package com.campus.campus_lost_found.storage;

import org.springframework.http.HttpStatus;

public class CloudinaryUploadException extends RuntimeException {

    private final HttpStatus status;

    public CloudinaryUploadException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
