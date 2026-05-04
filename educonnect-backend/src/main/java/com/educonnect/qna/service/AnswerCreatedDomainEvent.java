package com.educonnect.qna.service;

import java.util.UUID;

public record AnswerCreatedDomainEvent(Long answerId, Long questionId, UUID authorId, String authorName, UUID questionAuthorId) {
}
