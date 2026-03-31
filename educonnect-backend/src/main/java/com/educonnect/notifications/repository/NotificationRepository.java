package com.educonnect.notifications.repository;

import com.educonnect.notifications.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    long countByRecipientIdAndSeenFalse(UUID recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.seen = true WHERE n.recipient.id = :recipientId AND n.seen = false")
    int markAllAsSeen(UUID recipientId);
}
