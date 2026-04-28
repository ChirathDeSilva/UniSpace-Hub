package com.uniSpaceHub.demo.dto.notification;

import com.uniSpaceHub.demo.model.NotificationSeverity;
import com.uniSpaceHub.demo.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private String message;
    private NotificationType type;
    private NotificationSeverity severity;
    private String referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
