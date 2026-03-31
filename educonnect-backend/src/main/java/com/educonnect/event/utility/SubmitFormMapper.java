package com.educonnect.event.utility;

import com.educonnect.event.dto.response.RegistrationResponseDTO;
import com.educonnect.event.model.Registration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface SubmitFormMapper {

    @Mapping(target = "registrationId", source = "id")
    @Mapping(target = "eventId", source = "event.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "formId", source = "registrationForm.id")
    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(registration.getFormSubmitted()) ? \"SUBMITTED\" : \"PENDING\")")
    @Mapping(target = "submittedAt", source = "formResponse.submittedAt")
    @Mapping(target = "updatedAt", source = "statusUpdatedAt")
    @Mapping(target = "responses", source = "formResponse", qualifiedByName = "mapFormFieldResponses")
    RegistrationResponseDTO mapToResponseDTO(Registration registration);

    @Named("mapFormFieldResponses")
    default List<RegistrationResponseDTO.RegistrationFieldResponseDTO> mapFormFieldResponses(
            com.educonnect.event.model.FormResponse formResponse) {

        List<RegistrationResponseDTO.RegistrationFieldResponseDTO> responses = new ArrayList<>();
        if (formResponse != null && formResponse.getFieldResponses() != null) {
            responses = formResponse.getFieldResponses().stream()
//                    .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                    .map(r -> new RegistrationResponseDTO.RegistrationFieldResponseDTO(
                            r.getField().getId(), r.getField().getLabel(), r.getValue()))
                    .toList();
        }
        return responses;
    }
}
