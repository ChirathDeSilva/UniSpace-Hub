package com.uniSpaceHub.demo.dto.notification;

import com.uniSpaceHub.demo.model.NotificationSeverity;
import com.uniSpaceHub.demo.model.NotificationType;
import lombok.Data;

@Data
public class BroadcastRequest {
    private String message;
    private NotificationType type;
    private NotificationSeverity severity;
    private String referenceId;
}
