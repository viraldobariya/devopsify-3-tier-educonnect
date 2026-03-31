package com.educonnect.connection.service;

import java.util.UUID;

public record ConnectionCreatedDomainEvent(UUID connectionId, UUID userId , String type , String message, String url) {

}
