package com.educonnect.chat.service;

import java.util.UUID;

public record GroupInvitationCreatedDomainEvent(String groupName, UUID invitedUserId, UUID inviterUserId, String inviterName) {
}
