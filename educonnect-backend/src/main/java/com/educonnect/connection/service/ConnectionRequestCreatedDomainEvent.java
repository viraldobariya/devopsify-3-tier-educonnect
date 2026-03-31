package com.educonnect.connection.service;

import java.util.UUID;

public record ConnectionRequestCreatedDomainEvent(UUID senderId, UUID receiverId, String senderName) {
}
