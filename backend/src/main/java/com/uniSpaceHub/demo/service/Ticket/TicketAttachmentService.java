package com.uniSpaceHub.demo.service.Ticket;

import java.util.List;

import com.uniSpaceHub.demo.model.Ticket.TicketAttachment;

public interface TicketAttachmentService {

    TicketAttachment addAttachment(Long ticketId, String fileName, String fileType, String filePath, Long fileSize);

    List<TicketAttachment> getAttachmentsByTicket(Long ticketId);

    void deleteAttachment(Long attachmentId, Long userId);
}