package com.uniSpaceHub.demo.service.Ticket;

import java.util.List;

import com.uniSpaceHub.demo.model.Ticket.TicketAttachment;
import org.springframework.web.multipart.MultipartFile;

public interface TicketAttachmentService {

    TicketAttachment addAttachment(Long ticketId, MultipartFile file);

    List<TicketAttachment> getAttachmentsByTicket(Long ticketId);

    void deleteAttachment(Long attachmentId);
}