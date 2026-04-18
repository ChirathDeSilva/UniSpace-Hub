package com.uniSpaceHub.demo.controller.Ticket;

import com.uniSpaceHub.demo.model.Ticket.TicketComment;
import com.uniSpaceHub.demo.service.Ticket.TicketCommentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class TicketCommentController {

    @Autowired
    private TicketCommentService commentService;

    @PostMapping
    public TicketComment add(@RequestParam Long ticketId,
            @RequestParam Long userId,
            @RequestParam String message) {

        return commentService.addComment(ticketId, userId, message);
    }

    @GetMapping("/{ticketId}")
    public List<TicketComment> get(@PathVariable Long ticketId) {
        return commentService.getCommentsByTicket(ticketId);
    }

    @DeleteMapping("/{commentId}")
    public void delete(@PathVariable Long commentId, @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
    }
}