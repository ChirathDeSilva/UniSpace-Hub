package com.uniSpaceHub.demo.mapper.Ticket;

import org.springframework.stereotype.Component;

import com.uniSpaceHub.demo.dto.ticket.AddAttachmentRequest;

@Component
public class TicketAttachmentMapper {

    public Long toTicketId(AddAttachmentRequest request) {
        return request.getTicketId();
    }
}
