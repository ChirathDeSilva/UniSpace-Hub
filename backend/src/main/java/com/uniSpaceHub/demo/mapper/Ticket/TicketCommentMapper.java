package com.uniSpaceHub.demo.mapper.Ticket;

import org.springframework.stereotype.Component;

import com.uniSpaceHub.demo.dto.ticket.AddCommentRequest;

@Component
public class TicketCommentMapper {

    public Long toTicketId(AddCommentRequest request) {
        return request.getTicketId();
    }

    public Long toUserId(AddCommentRequest request) {
        return request.getUserId();
    }

    public String toMessage(AddCommentRequest request) {
        return request.getMessage();
    }
}
