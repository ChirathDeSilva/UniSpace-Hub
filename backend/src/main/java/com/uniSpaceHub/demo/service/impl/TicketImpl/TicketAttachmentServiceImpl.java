package com.uniSpaceHub.demo.service.impl.TicketImpl;

import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketAttachment;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.repository.Ticket.TicketRepository;
import com.uniSpaceHub.demo.service.Ticket.TicketAttachmentService;
import com.uniSpaceHub.demo.repository.Ticket.TicketAttachmentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketAttachmentServiceImpl implements TicketAttachmentService {

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Override
    public TicketAttachment addAttachment(Long ticketId, String fileName, String fileType, String filePath, Long fileSize) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // optional restriction
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Cannot add attachment to closed ticket");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(fileName);
        attachment.setFileType(fileType);
        attachment.setFilePath(filePath);
        attachment.setFileSize(fileSize);

        return attachmentRepository.save(attachment);
    }

    @Override
    public List<TicketAttachment> getAttachmentsByTicket(Long ticketId) {
        ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return attachmentRepository.findByTicketId(ticketId);
    }

    @Override
        public void deleteAttachment(Long attachmentId, Long userId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Ticket ticket = attachment.getTicket();

        boolean isOwner = ticket.getCreatedBy() != null &&
            ticket.getCreatedBy().getId().equals(userId);
        boolean isAssignedTech = ticket.getAssignedTo() != null &&
            ticket.getAssignedTo().getId().equals(userId);

        if (!isOwner && !isAssignedTech) {
            throw new RuntimeException("Not allowed to delete this attachment");
        }

        attachmentRepository.delete(attachment);
    }
}