package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.dto.notification.NotificationDto;
import com.uniSpaceHub.demo.model.NotificationSeverity;
import com.uniSpaceHub.demo.model.NotificationType;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.UserRole;

import java.util.List;

public interface NotificationService {

    NotificationDto createNotification(User recipient, String message, NotificationType type, NotificationSeverity severity, String referenceId);
    
    void sendToAllUsers(String message, NotificationType type, NotificationSeverity severity, String referenceId);
    
    void sendToUsersByRoles(List<UserRole> roles, String message, NotificationType type, NotificationSeverity severity, String referenceId);

    List<NotificationDto> getUserNotifications(Long userId);

    List<NotificationDto> getUnreadUserNotifications(Long userId);

    long getUnreadCount(Long userId);

    void markAllAsRead(Long userId);

    void markAsRead(Long notificationId);
    
    void sendLoginAlert(User user);
    
    void sendRoleChangeNotification(User user, UserRole newRole);
    
    void sendTokenExpiryWarning(User user);
}
