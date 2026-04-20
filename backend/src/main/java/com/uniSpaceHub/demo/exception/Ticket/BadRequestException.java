package com.uniSpaceHub.demo.exception.Ticket;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
