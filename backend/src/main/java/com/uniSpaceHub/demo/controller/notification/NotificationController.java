package com.uniSpaceHub.demo.controller.notification;

import com.uniSpaceHub.demo.dto.notification.NotificationDto;
import com.uniSpaceHub.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import com.uniSpaceHub.demo.dto.notification.BroadcastRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@RequestParam Long userId) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@RequestParam Long userId) {
        List<NotificationDto> notifications = notificationService.getUnreadUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcastNotification(@RequestBody BroadcastRequest request) {
        notificationService.sendToAllUsers(request.getMessage(), request.getType(), request.getSeverity(), request.getReferenceId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }
}
