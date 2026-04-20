package com.uniSpaceHub.demo.exception.Ticket;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
