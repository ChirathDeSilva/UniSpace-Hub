package com.uniSpaceHub.demo.model.Ticket;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ticket_attachments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TicketAttachment {

    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // File details
    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType; // image/png, image/jpeg

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String cloudinaryPublicId;

    private Long fileSize;

    // Relationship
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // Audit fields
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
}
