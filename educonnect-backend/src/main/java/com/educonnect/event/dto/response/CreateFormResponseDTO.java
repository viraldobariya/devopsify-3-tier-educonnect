package com.educonnect.event.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CreateFormResponseDTO {
    private Long id;
    private String title;
    private Long maxResponses;
    private Boolean formLimitEnabled;
    @JsonProperty("isActive")
    private boolean active;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime Deadline;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    private List<FormFieldResponseDTO> fields;

    @Getter
    @Setter
    public static class FormFieldResponseDTO {
        private Long id;
        private String label;
        private String type;
        private boolean required;
        private int orderIndex;
        private String placeholder;
        private String helpText;
        private String options;
    }
}
