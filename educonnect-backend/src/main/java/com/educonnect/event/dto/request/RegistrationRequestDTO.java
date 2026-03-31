package com.educonnect.event.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RegistrationRequestDTO {

    @NotEmpty(message = "Responses cannot be empty")
    @Valid
    private List<RegistrationFieldDTO> responses;

    @Getter
    @Setter
    public static class RegistrationFieldDTO {

        @NotNull(message = "Field ID is required")
        private Long fieldId;

        private String value;

    }
}
