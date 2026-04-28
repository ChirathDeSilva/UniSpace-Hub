package com.uniSpaceHub.demo.repository.Ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uniSpaceHub.demo.model.Ticket.SlaStatus;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatusNotIn(List<TicketStatus> statuses);

    List<Ticket> findBySlaStatusIn(List<SlaStatus> statuses);

    List<Ticket> findByAssignedToIdAndSlaStatusIn(Long assignedToId, List<SlaStatus> statuses);
}
