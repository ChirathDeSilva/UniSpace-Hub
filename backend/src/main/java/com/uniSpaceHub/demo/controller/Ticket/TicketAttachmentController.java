package com.uniSpaceHub.demo.controller.Ticket;

import com.uniSpaceHub.demo.dto.ticket.AddAttachmentRequest;
import com.uniSpaceHub.demo.mapper.Ticket.TicketAttachmentMapper;
import com.uniSpaceHub.demo.model.Ticket.TicketAttachment;
import com.uniSpaceHub.demo.service.Ticket.TicketAttachmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class TicketAttachmentController {

    @Autowired
    private TicketAttachmentService attachmentService;

    @Autowired
    private TicketAttachmentMapper ticketAttachmentMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TicketAttachment add(@Valid @ModelAttribute AddAttachmentRequest request,
            @RequestParam("file") MultipartFile file) {

        return attachmentService.addAttachment(
                ticketAttachmentMapper.toTicketId(request),
                file);
    }

    @GetMapping("/{ticketId}")
    public List<TicketAttachment> get(@PathVariable Long ticketId) {
        return attachmentService.getAttachmentsByTicket(ticketId);
    }

    @DeleteMapping("/{attachmentId}")
    public void delete(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
    }
}