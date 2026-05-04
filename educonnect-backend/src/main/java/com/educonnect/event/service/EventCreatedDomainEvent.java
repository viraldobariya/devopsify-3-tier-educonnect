package com.educonnect.event.service;

import java.util.UUID;


public record EventCreatedDomainEvent(Long eventId, UUID creatorId) {
}
