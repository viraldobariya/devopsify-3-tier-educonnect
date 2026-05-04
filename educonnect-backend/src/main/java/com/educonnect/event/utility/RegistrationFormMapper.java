package com.educonnect.event.utility;

import com.educonnect.event.dto.request.CreateFormRequestDTO;
import com.educonnect.event.dto.response.CreateFormResponseDTO;
import com.educonnect.event.model.FormField;
import com.educonnect.event.model.RegistrationForm;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RegistrationFormMapper {

    // Request DTO to Entity mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "responses", ignore = true)
    @Mapping(target = "fields", source = "fields", qualifiedByName = "mapFieldsToEntity")
    RegistrationForm toEntity(CreateFormRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "form", ignore = true)
    FormField toEntity(CreateFormRequestDTO.CreateFormFieldDTO dto);

    @Named("mapFieldsToEntity")
    default List<FormField> mapFieldsToEntity(List<CreateFormRequestDTO.CreateFormFieldDTO> fields) {
        if (fields == null) return null;
        return fields.stream()
                .map(this::toEntity)
                .toList();
    }

    // Entity to Response DTO mappings
    @Mapping(target = "fields", source = "fields", qualifiedByName = "mapFieldsToResponse")
    @Mapping(target = "active", source = "isActive", defaultValue = "false")
    @Mapping(target = "deadline", source = "deadline")
    @Mapping(target = "maxResponses" , source = "maxResponses")
    @Mapping(target = "formLimitEnabled", source = "formLimitEnabled")
    CreateFormResponseDTO toResponseDTO(RegistrationForm entity);

    @Mapping(target = ".", source = ".")
    CreateFormResponseDTO.FormFieldResponseDTO toResponseDTO(FormField field);

    @Named("mapFieldsToResponse")
    default List<CreateFormResponseDTO.FormFieldResponseDTO> mapFieldsToResponse(List<FormField> fields) {
        if (fields == null) return null;
        return fields.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    default List<CreateFormResponseDTO> toResponseDTOList(List<RegistrationForm> forms) {
        if (forms == null) return null;
        return forms.stream()
                .map(this::toResponseDTO)
                .toList();
    }

}
