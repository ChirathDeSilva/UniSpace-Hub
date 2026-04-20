package com.uniSpaceHub.demo.exception.Ticket;

public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
