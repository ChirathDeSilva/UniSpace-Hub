package com.uniSpaceHub.demo.controller.Ticket;


import com.uniSpaceHub.demo.model.Ticket.TicketAttachment;
import com.uniSpaceHub.demo.service.Ticket.TicketAttachmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class TicketAttachmentController {

    @Autowired
    private TicketAttachmentService attachmentService;

    @PostMapping
    public TicketAttachment add(@RequestParam Long ticketId,
                                @RequestParam String fileName,
                                @RequestParam String fileType,
                                @RequestParam String filePath,
                                @RequestParam Long fileSize) {

        return attachmentService.addAttachment(ticketId, fileName, fileType, filePath, fileSize);
    }

    @GetMapping("/{ticketId}")
    public List<TicketAttachment> get(@PathVariable Long ticketId) {
        return attachmentService.getAttachmentsByTicket(ticketId);
    }

    @DeleteMapping("/{attachmentId}")
    public void delete(@PathVariable Long attachmentId, @RequestParam Long userId) {
        attachmentService.deleteAttachment(attachmentId, userId);
    }
}