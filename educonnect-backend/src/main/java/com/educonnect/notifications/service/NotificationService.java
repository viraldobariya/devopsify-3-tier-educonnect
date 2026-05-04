package com.educonnect.notifications.service;

import com.educonnect.notifications.dto.responses.NotificationResponse;
import com.educonnect.notifications.entity.Notification;
import com.educonnect.notifications.repository.NotificationRepository;
import com.educonnect.user.entity.Users;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository repo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository repo, SimpMessagingTemplate messagingTemplate){
        this.repo = repo;
        this.messagingTemplate = messagingTemplate;
    }

    public void createNotification(Users recipient, Users actor, String type, String message, String url) {
        Notification n = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .url(url)
                .seen(false)
                .build();

        repo.save(n);

        NotificationResponse response = toDto(n);
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                response
        );
    }

    public Page<NotificationResponse> listNotifications(UUID recipientId, int page, int size) {
        Page<Notification> p = repo.findByRecipientIdOrderByCreatedAtDesc(recipientId, PageRequest.of(page, size));
        return p.map(this::toDto);
    }

    public long getUnreadCount(UUID recipientId) {
        return repo.countByRecipientIdAndSeenFalse(recipientId);
    }

    @Transactional
    public int markAllAsSeen(UUID recipientId) {
        return repo.markAllAsSeen(recipientId);
    }

    // Add method to mark single notification as read
    @Transactional
    public void markAsRead(UUID notificationId) {
        repo.findById(notificationId).ifPresent(notification -> {
            notification.setSeen(true);
            repo.save(notification);
        });
    }

    private NotificationResponse toDto(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMessage(),
                n.getType(),
                n.isSeen(),
                n.getUrl(),
                n.getCreatedAt(),
                n.getActor() != null ? n.getActor().getId() : null
        );
    }
}