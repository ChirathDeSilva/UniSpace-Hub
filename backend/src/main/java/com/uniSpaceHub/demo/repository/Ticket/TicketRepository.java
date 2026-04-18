package com.uniSpaceHub.demo.repository.Ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uniSpaceHub.demo.model.Ticket.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
