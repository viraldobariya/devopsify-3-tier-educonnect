package com.educonnect.event.dto.response;

import com.educonnect.event.model.Registration;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationDTO {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String eventDescription;
    private String university;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private String bannerUrl;
    private String attachmentUrl;
    private String status;
    private Long maxParticipants;
    private Long currentParticipants;
    private UUID userId;
    private String userFullName;
    private String userEmail;
    private String createdByUsername;
    private UUID createdById;
    private String createdByProfilePictureUrl;
    private LocalDateTime registrationDate;

    public RegistrationDTO(Registration registration) {
        this.id = registration.getId();
        this.eventId = registration.getEvent().getId();
        this.eventTitle = registration.getEvent().getTitle();
        this.eventDescription = registration.getEvent().getDescription();
        this.university = registration.getEvent().getUniversity();
        this.startDate = registration.getEvent().getStartDate();
        this.endDate = registration.getEvent().getEndDate();
        this.location = registration.getEvent().getLocation();
        this.bannerUrl = registration.getEvent().getBannerUrl();
        this.attachmentUrl = registration.getEvent().getAttachmentUrl();
        this.status = registration.getEvent().getStatus().toString();
        this.maxParticipants = registration.getEvent().getMaxParticipants();
        this.currentParticipants = registration.getEvent().getCurrentParticipantCount();
        this.userId = registration.getUser().getId();
        this.userFullName = registration.getUser().getFullName();
        this.userEmail = registration.getUser().getEmail();
        this.createdByUsername = registration.getEvent().getCreatedBy().getUsername();
        this.createdById = registration.getEvent().getCreatedBy().getId();
        this.createdByProfilePictureUrl = registration.getEvent().getCreatedBy().getAvatar();
        this.registrationDate = registration.getRegistrationDate();
    }

    public static RegistrationDTO from(Registration registration) {
        return new RegistrationDTO(registration);
    }
}
