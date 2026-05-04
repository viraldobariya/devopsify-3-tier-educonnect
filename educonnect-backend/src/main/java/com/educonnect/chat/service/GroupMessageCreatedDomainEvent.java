package com.educonnect.chat.service;

import com.educonnect.user.entity.Users;
import java.util.UUID;

public record GroupMessageCreatedDomainEvent(String groupName, UUID senderId, String senderName, String type, String message) {
}
