package com.educonnect.event.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CreateFormRequestDTO {
    private String title;
    private boolean isActive;
    private Long maxResponses;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
    private List<CreateFormFieldDTO> fields;

    @Getter
    @Setter
    public static class CreateFormFieldDTO {
        private String label;
        private String type;
        private boolean required;
        private int orderIndex;
        private String placeholder;
        private String helpText;
        private String options;
    }
}
