package com.educonnect.event.dto.response;


import lombok.*;
import org.springframework.core.SpringVersion;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ViewRegistrationsDTO {

    private String eventTitle;
    private Long registrationCount;
    private List<RegistrationDetail> registrations;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegistrationDetail {
        private UUID userId;
        private String userFullName;
        private String userEmail;
        private String avtarUrl;
    }
}
