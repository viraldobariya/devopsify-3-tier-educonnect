package com.educonnect.notifications.dto.responses;
// package com.educonnect.notification.dto;
import com.educonnect.notifications.entity.NotificationType;
import lombok.*;

import java.util.Date;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String message;
    private String type;
    private boolean seen;
    private String url;
    private Date createdAt;
    private UUID actorId;
}
