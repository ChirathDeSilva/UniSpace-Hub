package com.uniSpaceHub.demo.model.Ticket;

import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_workflow_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketWorkflowEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id", nullable = false)
    private User actor;

    @Column(nullable = false, length = 80)
    private String actionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_ticket_status")
    private TicketStatus previousTicketStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_ticket_status")
    private TicketStatus newTicketStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_facility_status")
    private FacilityStatus previousFacilityStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_facility_status")
    private FacilityStatus newFacilityStatus;

    @Column(length = 1000)
    private String note;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
