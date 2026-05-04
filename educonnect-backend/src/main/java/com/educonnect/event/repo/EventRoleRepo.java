package com.educonnect.event.repo;

import com.educonnect.event.model.EventRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventRoleRepo extends JpaRepository<EventRole, Long> {
    EventRole findByUserIdAndEventId(UUID id, Long eventId);
}
