package com.uniSpaceHub.demo.repository.Ticket;

import com.uniSpaceHub.demo.model.Ticket.TicketWorkflowEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketWorkflowEventRepository extends JpaRepository<TicketWorkflowEvent, Long> {
    List<TicketWorkflowEvent> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
