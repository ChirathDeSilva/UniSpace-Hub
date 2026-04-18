package com.uniSpaceHub.demo.service.impl.TicketImpl;

import com.uniSpaceHub.demo.model.*;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketComment;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.repository.Ticket.TicketRepository;
import com.uniSpaceHub.demo.service.Ticket.TicketCommentService;
import com.uniSpaceHub.demo.repository.UserRepository;
import com.uniSpaceHub.demo.repository.Ticket.TicketCommentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketCommentServiceImpl implements TicketCommentService {

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;


    // ADD COMMENT
    @Override
    public TicketComment addComment(Long ticketId, Long userId, String message) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //VALIDATION: message required
        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException("Comment message cannot be empty");
        }

        //STATUS VALIDATION
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS &&
            ticket.getStatus() != TicketStatus.RESOLVED &&
            ticket.getStatus() != TicketStatus.REJECTED &&
            ticket.getStatus() != TicketStatus.CANCELLED) {

            throw new RuntimeException("Comments not allowed in current status");
        }

        TicketComment comment = new TicketComment();
        comment.setMessage(message);
        comment.setTicket(ticket);
        comment.setUser(user);

        return commentRepository.save(comment);
    }

    
    // GET COMMENTS BY TICKET
    @Override
    public List<TicketComment> getCommentsByTicket(Long ticketId) {

        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return commentRepository.findByTicketId(ticketId);
    }

    
    // DELETE COMMENT
    @Override
    public void deleteComment(Long commentId, Long userId) {

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        //Only owner of comment can delete
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can delete only your own comment");
        }

        commentRepository.delete(comment);
    }
}