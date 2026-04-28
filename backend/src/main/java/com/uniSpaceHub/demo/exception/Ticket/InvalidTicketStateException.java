package com.uniSpaceHub.demo.exception.Ticket;

public class InvalidTicketStateException extends RuntimeException {
    public InvalidTicketStateException(String message) {
        super(message);
    }
}
