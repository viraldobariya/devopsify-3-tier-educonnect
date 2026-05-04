package com.educonnect.event.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class EventResponseDto {
    private Long id;
    private String title;
    private String description;
    private String university;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private String bannerUrl;
    private String attachmentUrl;
    private String status;
    private Long maxParticipants;
    private Long currentParticipants;
    private String createdByUsername;
    private UUID createdById;
    private  String createdByProfilePictureUrl;
}