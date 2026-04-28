package com.uniSpaceHub.demo.service.impl;

import com.uniSpaceHub.demo.dto.notification.NotificationDto;
import com.uniSpaceHub.demo.model.Notification;
import com.uniSpaceHub.demo.model.NotificationSeverity;
import com.uniSpaceHub.demo.model.NotificationType;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.UserRole;
import com.uniSpaceHub.demo.repository.NotificationRepository;
import com.uniSpaceHub.demo.repository.UserRepository;
import com.uniSpaceHub.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public NotificationDto createNotification(User recipient, String message, NotificationType type, NotificationSeverity severity, String referenceId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setType(type);
        notification.setSeverity(severity);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void sendToAllUsers(String message, NotificationType type, NotificationSeverity severity, String referenceId) {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            createNotification(user, message, type, severity, referenceId);
        }
    }

    @Override
    @Transactional
    public void sendToUsersByRoles(List<UserRole> roles, String message, NotificationType type, NotificationSeverity severity, String referenceId) {
        List<User> targetUsers = userRepository.findByRole_NameIn(roles);
        for (User user : targetUsers) {
            createNotification(user, message, type, severity, referenceId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    @Transactional
    public void sendLoginAlert(User user) {
        createNotification(user, "Security Alert: New login detected.", NotificationType.AUTHENTICATION, NotificationSeverity.INFO, null);
    }

    @Override
    @Transactional
    public void sendRoleChangeNotification(User user, UserRole newRole) {
        String roleName = newRole.name().replace("ROLE_", "");
        createNotification(user, "Account Updated: You have been granted [" + roleName + "] privileges.", NotificationType.AUTHENTICATION, NotificationSeverity.INFO, null);
    }

    @Override
    @Transactional
    public void sendTokenExpiryWarning(User user) {
        createNotification(user, "Session Update: For your security, your login session will expire in 10 minutes. Please save your work.", NotificationType.AUTHENTICATION, NotificationSeverity.WARNING, null);
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .severity(notification.getSeverity())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
