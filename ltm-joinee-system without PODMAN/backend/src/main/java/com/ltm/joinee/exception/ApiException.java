package com.ltm.joinee.exception;

import org.springframework.http.HttpStatus;

/** Thrown for expected failures (duplicate = 409, not found = 404). */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
