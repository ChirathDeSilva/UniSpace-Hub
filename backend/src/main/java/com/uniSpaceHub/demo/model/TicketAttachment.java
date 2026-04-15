package com.uniSpaceHub.demo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_attachments")
public class TicketAttachment {

    //  Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //  File details
    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType; // image/png, image/jpeg

    @Column(nullable = false)
    private String filePath;

    private Long fileSize;

    //  Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    //  Audit fields
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
}
