package com.educonnect.event.service;

import com.educonnect.event.enums.EventRoleType;
import com.educonnect.event.model.EventRole;
import com.educonnect.event.repo.EventRoleRepo;
import com.educonnect.event.repo.EventsRepo;
import com.educonnect.event.repo.RegistrationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventRoleService {

    private final EventRoleRepo eventRoleRepo;
    private final EventsRepo eventsRepo;
    private final RegistrationRepo registrationRepo;


    @PreAuthorize("isAuthenticated()")
    public boolean hasRole(UUID userId, Long eventId, EventRoleType roleType) {
        if (userId == null || eventId == null || roleType == null) {
            return false;
        }

        if (roleType == EventRoleType.CREATOR && isEventCreator(userId, eventId)) {
            return true;
        }

        EventRole eventRole = eventRoleRepo.findByUserIdAndEventId(userId, eventId);
        return eventRole != null && eventRole.getRole() == roleType;
    }


    @PreAuthorize("isAuthenticated()")
    public boolean isEventCreator(UUID userId, Long eventId) {
        if (userId == null || eventId == null) {
            return false;
        }

        return eventsRepo.findById(eventId)
                .map(event -> userId.equals(event.getCreatedBy().getId()))
                .orElse(false);
    }

    @PreAuthorize("isAuthenticated()")
    public boolean isRegisteredParticipant(UUID userId, Long eventId) {
        if (userId == null || eventId == null) {
            return false;
        }

        return registrationRepo.existsByUserIdAndEventId(userId, eventId);
    }


    @PreAuthorize("isAuthenticated()")
    public List<EventRoleType> getUserRoles(UUID userId, Long eventId) {
        List<EventRoleType> roles = new ArrayList<>();

        if (userId == null || eventId == null) {
            return roles;
        }

        if (isEventCreator(userId, eventId)) {
            roles.add(EventRoleType.CREATOR);
        }

        EventRole eventRole = eventRoleRepo.findByUserIdAndEventId(userId, eventId);
        if (eventRole != null && eventRole.getRole() != EventRoleType.CREATOR) {
            roles.add(eventRole.getRole());
        }

        return roles;
    }


    @PreAuthorize("isAuthenticated() and (@eventRoleService.isEventCreator(authentication.principal.id, #eventId) or @eventRoleService.hasRole(authentication.principal.id, #eventId, T(com.educonnect.event.enums.EventRoleType).ORGANIZER))")
    public boolean assignRole(UUID userId, Long eventId, EventRoleType roleType) {
        if (userId == null || eventId == null || roleType == null || roleType == EventRoleType.CREATOR) {
            return false;
        }


        EventRole existingRole = eventRoleRepo.findByUserIdAndEventId(userId, eventId);
        if (existingRole != null) {
            existingRole.setRole(roleType);
            eventRoleRepo.save(existingRole);
            return true;
        }

        return eventsRepo.findById(eventId).map(event -> {
            EventRole newRole = EventRole.builder()
                    .event(event)
                    .role(roleType)
                    .build();
            return true;
        }).orElse(false);
    }

    @PreAuthorize("isAuthenticated() and (@eventRoleService.isEventCreator(authentication.principal.id, #eventId) or @eventRoleService.hasRole(authentication.principal.id, #eventId, T(com.educonnect.event.enums.EventRoleType).ORGANIZER))")
    public boolean removeRole(UUID userId, Long eventId, EventRoleType roleType) {
        if (userId == null || eventId == null || roleType == null || roleType == EventRoleType.CREATOR) {
            return false; // Cannot remove CREATOR role
        }

        EventRole eventRole = eventRoleRepo.findByUserIdAndEventId(userId, eventId);
        if (eventRole != null && eventRole.getRole() == roleType) {
            eventRoleRepo.delete(eventRole);
            return true;
        }

        return false;
    }


    @PreAuthorize("isAuthenticated()")
    public boolean hasAdministrativeRole(UUID userId, Long eventId) {
        return isEventCreator(userId, eventId) ||
                hasRole(userId, eventId, EventRoleType.ORGANIZER);
    }


}