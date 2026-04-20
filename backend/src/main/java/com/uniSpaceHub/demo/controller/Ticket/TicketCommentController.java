package com.uniSpaceHub.demo.controller.Ticket;

import com.uniSpaceHub.demo.dto.ticket.AddCommentRequest;
import com.uniSpaceHub.demo.mapper.Ticket.TicketCommentMapper;
import com.uniSpaceHub.demo.model.Ticket.TicketComment;
import com.uniSpaceHub.demo.service.Ticket.TicketCommentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class TicketCommentController {

    @Autowired
    private TicketCommentService commentService;

    @Autowired
    private TicketCommentMapper ticketCommentMapper;

    @PostMapping
    public TicketComment add(@Valid @RequestBody AddCommentRequest request) {

        return commentService.addComment(
                ticketCommentMapper.toTicketId(request),
                ticketCommentMapper.toUserId(request),
                ticketCommentMapper.toMessage(request));
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