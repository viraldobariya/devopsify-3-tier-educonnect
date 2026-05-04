package com.educonnect.event.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UpdateFormRequestDTO {
    private String title;
    private Boolean isActive;
    private Long maxResponses;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
    private List<UpdateFormFieldDTO> fields;


    @Getter
    @Setter
    public static class UpdateFormFieldDTO {
        private Long id; // For existing fields, null for new fields
        private String label;
        private String type;
        private Boolean required; // Changed to Boolean to handle null
        private Integer orderIndex; // Changed to Integer to handle null
        private String placeholder;
        private String helpText;
        private String options;
        private boolean isDeleted; // Flag to indicate if the field should be deleted
    }
}