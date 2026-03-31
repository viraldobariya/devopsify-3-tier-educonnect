package com.educonnect.event.utility;

import com.educonnect.event.dto.response.EventResponseDto;
import com.educonnect.event.model.Events;

public class EventMapper {

    public static EventResponseDto toEventResponseDto(Events event) {
        if (event == null) {
            return null;
        }
        return new EventResponseDto(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getUniversity(),
                event.getStartDate(),
                event.getEndDate(),
                event.getLocation(),
                event.getBannerUrl(),
                event.getAttachmentUrl(),
                event.getStatus().name(),
                event.getMaxParticipants(),
                event.getCurrentParticipantCount(),
                event.getCreatedBy().getUsername(),
                event.getCreatedBy().getId(),
                event.getCreatedBy().getAvatar()
        );
    }

}
