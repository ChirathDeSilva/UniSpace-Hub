package com.uniSpaceHub.demo.service.impl.TicketImpl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniSpaceHub.demo.exception.Ticket.BadRequestException;
import com.uniSpaceHub.demo.exception.Ticket.InvalidTicketStateException;
import com.uniSpaceHub.demo.exception.Ticket.ResourceNotFoundException;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketAttachment;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.repository.Ticket.TicketRepository;
import com.uniSpaceHub.demo.service.Ticket.TicketAttachmentService;
import com.uniSpaceHub.demo.repository.Ticket.TicketAttachmentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class TicketAttachmentServiceImpl implements TicketAttachmentService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList("png", "jpg", "jpeg", "pdf"));

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public TicketAttachment addAttachment(Long ticketId, MultipartFile file) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        validateFile(file);

        // optional restriction
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidTicketStateException("Cannot add attachment to closed ticket");
        }

        Map<?, ?> uploadResult;
        try {
            uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "uniSpaceHub/tickets",
                            "resource_type", "auto"));
        } catch (IOException ex) {
            throw new BadRequestException("Failed to upload attachment to Cloudinary");
        }

        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");
        if (secureUrl == null || publicId == null) {
            throw new BadRequestException("Invalid upload response from Cloudinary");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setFilePath(secureUrl);
        attachment.setCloudinaryPublicId(publicId);
        attachment.setFileSize(file.getSize());

        return attachmentRepository.save(attachment);
    }

    @Override
    public List<TicketAttachment> getAttachmentsByTicket(Long ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        return attachmentRepository.findByTicketId(ticketId);
    }

    @Override
    public void deleteAttachment(Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        try {
            cloudinary.uploader().destroy(attachment.getCloudinaryPublicId(), ObjectUtils.emptyMap());
        } catch (IOException ex) {
            throw new BadRequestException("Failed to delete attachment from Cloudinary");
        }

        attachmentRepository.delete(attachment);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size must be less than or equal to 5MB");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new BadRequestException("File must have a valid extension");
        }

        String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only png, jpg, jpeg, and pdf files are allowed");
        }
    }

}