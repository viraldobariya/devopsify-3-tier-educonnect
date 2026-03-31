package com.educonnect.event.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class RegistrationResponseDTO {

    // Getters and Setters
    private Long registrationId;
    private String username;
    private Long eventId;
    private Long formId;
    private UUID userId;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private List<RegistrationFieldResponseDTO> responses;

    // Constructors
    public RegistrationResponseDTO() {}

    public RegistrationResponseDTO(Long registrationId, Long eventId, Long formId, UUID userId,
                                   String status, LocalDateTime submittedAt) {
        this.registrationId = registrationId;
        this.eventId = eventId;
        this.formId = formId;
        this.userId = userId;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public static class RegistrationFieldResponseDTO {
        private Long fieldId;
        private String fieldLabel;
        private String value;

        public RegistrationFieldResponseDTO() {}

        public RegistrationFieldResponseDTO(Long fieldId, String fieldLabel, String value) {
            this.fieldId = fieldId;
            this.fieldLabel = fieldLabel;
            this.value = value;
        }

        public Long getFieldId() { return fieldId; }
        public void setFieldId(Long fieldId) { this.fieldId = fieldId; }

        public String getFieldLabel() { return fieldLabel; }
        public void setFieldLabel(String fieldLabel) { this.fieldLabel = fieldLabel; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
}
