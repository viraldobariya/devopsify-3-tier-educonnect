package com.educonnect.qna.service;

import java.util.UUID;

public record QuestionCreatedDomainEvent(Long questionId, UUID authorId, String authorName, String title) {
}
