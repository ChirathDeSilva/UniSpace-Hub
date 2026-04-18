package com.uniSpaceHub.demo.service.Ticket;

import java.util.List;

import com.uniSpaceHub.demo.model.Ticket.TicketComment;

public interface TicketCommentService {

    TicketComment addComment(Long ticketId, Long userId, String message);

    List<TicketComment> getCommentsByTicket(Long ticketId);

    void deleteComment(Long commentId, Long userId);
}
