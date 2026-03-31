package com.educonnect.event.service;

import com.educonnect.event.dto.request.CreateFormRequestDTO;
import com.educonnect.event.dto.request.UpdateFormRequestDTO;
import com.educonnect.event.dto.response.CreateFormResponseDTO;
import com.educonnect.event.enums.FieldType;
import com.educonnect.event.model.*;
import com.educonnect.event.repo.EventsRepo;
import com.educonnect.event.repo.RegistrationFormRepo;
import com.educonnect.event.utility.RegistrationFormMapper;
import com.educonnect.exceptionhandling.exception.EventNotFoundException;
import com.educonnect.exceptionhandling.exception.NoActiveFormsException;
import com.educonnect.user.entity.Users;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

import java.util.*;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class FormCreateService {

    private final EventsRepo eventsRepo;
    private final RegistrationFormRepo registrationFormRepo;
    private final EventService eventService;
    private final RegistrationFormMapper registrationFormMapper;
    private final EventRoleService eventRoleService;
    private final FormSubmitService  formSubmitService;

    public CreateFormResponseDTO createForm(Long eventId, CreateFormRequestDTO formRequestDTO, Users currentUser) {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        if(!eventService.isUserEventCreator(eventId, currentUser.getId())) {
            throw new IllegalArgumentException("Only event creator can create forms");
        }




        RegistrationForm form = registrationFormMapper.toEntity(formRequestDTO);
        form.setEvent(event);


        if (form.getTitle() == null || form.getTitle().trim().isEmpty()) {
            form.setTitle("Registration Form for " + event.getTitle());
        }

        if(form.getDeadline() != null && form.getDeadline().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Deadline cannot be in the past");
        }

        if (form.getDeadline() == null) {
            form.setDeadline(event.getStartDate().minusDays(1));
        }


        if(form.getFields() != null && !form.getFields().isEmpty()) {
            setupFieldRelationships(form);
            validateFields(form.getFields());
        }

        if(form.getMaxResponses() == null || form.getMaxResponses() <= 0) {
            form.setMaxResponses(event.getMaxParticipants());
        } else if(form.getMaxResponses() > event.getMaxParticipants()) {
            throw new IllegalArgumentException("Max responses cannot exceed event capacity of " + event.getMaxParticipants());
        }

        RegistrationForm savedForm = registrationFormRepo.save(form);
        log.info("Form {} created for event {} by user {} with status: {}",
                savedForm.getId(), eventId, currentUser.getId(),
                savedForm.getIsActive() ? "active" : "inactive");

        return registrationFormMapper.toResponseDTO(savedForm);
    }


    private boolean hasActiveForm(Events event) {
        return registrationFormRepo.existsByEventAndIsActiveTrue(event);
    }

    private void validateFields(List<FormField> fields) {
        for(FormField f : fields){
            if(f.getLabel() == null || f.getLabel().trim().isEmpty()){
                throw new IllegalArgumentException("Field label cannot be empty");
            }
            if(f.getType() == null){
                throw new IllegalArgumentException("Field type cannot be null");
            }
            if(f.getRequired() == null){
                f.setRequired(false);
            }
        }
    }

    private void setupFieldRelationships(RegistrationForm form) {
        for(int i = 0 ; i < form.getFields().size() ; i++) {
            FormField field = form.getFields().get(i);
            field.setForm(form);

            if (field.getOrderIndex() == null) {
                field.setOrderIndex(i);
            }

            if (field.getFieldResponses() != null && !field.getFieldResponses().isEmpty()) {
                for (FormFieldResponse r : field.getFieldResponses()) {
                    r.setField(field);
                }
            }
        }
    }


    public List<CreateFormResponseDTO> getAllFormsByEventId(Long eventId , Users user) {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        if(event.getRegistrationForms() == null || event.getRegistrationForms().isEmpty()) {
            throw new IllegalArgumentException("No forms found for this event");
        }



        if(user.getRole() == null || !user.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("User does not have permission to view All forms for this event");
        }


        List<RegistrationForm> forms = registrationFormRepo.findByEvent(event);
        return registrationFormMapper.toResponseDTOList(forms);
    }

    public CreateFormResponseDTO updateForm(Long eventId, Long formId, UpdateFormRequestDTO updateRequest, Users currentUser) {

        Events events = eventsRepo.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        RegistrationForm existingForm = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found with id: " + formId));

        if (!existingForm.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Form does not belong to the specified event");
        }

        if(!eventRoleService.hasAdministrativeRole(currentUser.getId(), eventId) ) {
            throw new IllegalArgumentException("User does not have permission to update forms for this event");
        }

        // Update basic form properties
        if (updateRequest.getTitle() != null && !updateRequest.getTitle().trim().isEmpty()) {
            existingForm.setTitle(updateRequest.getTitle());
        }

        if (updateRequest.getIsActive() != null) {
            existingForm.setIsActive(updateRequest.getIsActive());
        }

        if (updateRequest.getMaxResponses() != null) {
            if (updateRequest.getMaxResponses() <= 0) {
                throw new IllegalArgumentException("Max responses must be greater than 0");
            }
            if (updateRequest.getMaxResponses() > events.getMaxParticipants()) {
                throw new IllegalArgumentException("Max responses cannot exceed event capacity of " + events.getMaxParticipants());
            }
            existingForm.setMaxResponses(updateRequest.getMaxResponses());
        }

        if (updateRequest.getDeadline() != null) {
            if (updateRequest.getDeadline().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Deadline cannot be in the past");
            }
            if (updateRequest.getDeadline().isAfter(events.getStartDate())) {
                throw new IllegalArgumentException("Deadline cannot be after event start date");
            }
            existingForm.setDeadline(updateRequest.getDeadline());
        }

        if (updateRequest.getFields() != null) {
            updateFormFields(existingForm, updateRequest.getFields());
        }

        formSubmitService.updateFormLimitEnabled(existingForm , events);

        RegistrationForm savedForm = registrationFormRepo.save(existingForm);
        log.info("Form {} updated successfully for event {} by user {}", formId, eventId, currentUser.getId());
        return registrationFormMapper.toResponseDTO(savedForm);
    }

    private void updateFormFields(RegistrationForm existingForm, List<UpdateFormRequestDTO.UpdateFormFieldDTO> fieldUpdates) {
        List<FormField> existingFields = existingForm.getFields();
        if (existingFields == null) {
            existingFields = new ArrayList<>();
            existingForm.setFields(existingFields);
        }

        Map<Long, FormField> existingFieldMap = existingFields.stream()
                .filter(field -> field.getId() != null && !field.getDeleted())
                .collect(Collectors.toMap(FormField::getId, field -> field));

        Set<Long> updatedFieldIds = fieldUpdates.stream()
                .map(UpdateFormRequestDTO.UpdateFormFieldDTO::getId)
                .filter(id -> id != null && !isFieldMarkedForDeletion(fieldUpdates, id))
                .collect(Collectors.toSet());

        // Mark fields for deletion that are not in the update request
        for (FormField existingField : existingFields) {
            if (existingField.getId() != null && !updatedFieldIds.contains(existingField.getId())) {
                boolean hasResponses = existingField.getFieldResponses() != null &&
                        existingField.getFieldResponses().stream()
                                .anyMatch(response -> !response.getIsDeleted());

                if (hasResponses) {
                    existingField.setDeleted(true);
                    log.info("Field {} marked as deleted (has responses)", existingField.getId());
                } else {
                    log.info("Field {} will be removed (no responses)", existingField.getId());
                    existingFieldMap.remove(existingField.getId());
                    existingFields.remove(existingField);
                }
            }
        }

        List<FormField> updatedFields = new ArrayList<>();

        for (int i = 0; i < fieldUpdates.size(); i++) {
            UpdateFormRequestDTO.UpdateFormFieldDTO fieldUpdate = fieldUpdates.get(i);

            // Skip fields explicitly marked for deletion
            if (fieldUpdate.isDeleted()) {
                if (fieldUpdate.getId() != null && existingFieldMap.containsKey(fieldUpdate.getId())) {
                    FormField field = existingFieldMap.get(fieldUpdate.getId());
                    field.setDeleted(true);
                    updatedFields.add(field);
                    log.info("Field {} marked as deleted", field.getId());
                }
                continue;
            }

            FormField field;
            if (fieldUpdate.getId() != null && existingFieldMap.containsKey(fieldUpdate.getId())) {
                field = existingFieldMap.get(fieldUpdate.getId());
                boolean hasResponses = field.getFieldResponses() != null &&
                        field.getFieldResponses().stream()
                                .anyMatch(response -> !response.getIsDeleted());

                if (hasResponses) {
                    updateFieldPropertiesMinor(field, fieldUpdate);
                    log.info("Field {} updated with minor changes only (has responses)", field.getId());
                } else {
                    updateFieldProperties(field, fieldUpdate);
                    log.info("Field {} updated fully (no responses)", field.getId());
                }
                field.setDeleted(false);
            } else {
                field = new FormField();
                updateFieldProperties(field, fieldUpdate);
                field.setForm(existingForm);
                field.setDeleted(false);
                log.info("New field created: {}", fieldUpdate.getLabel());
            }

            if (fieldUpdate.getOrderIndex() != null && fieldUpdate.getOrderIndex() >= 0) {
                field.setOrderIndex(fieldUpdate.getOrderIndex());
            } else {
                field.setOrderIndex(i);
            }

            updatedFields.add(field);
        }

        // Add any remaining deleted fields
        for (FormField existingField : existingFields) {
            if (existingField.getDeleted() && !updatedFields.contains(existingField)) {
                updatedFields.add(existingField);
            }
        }

        updatedFields.sort((f1, f2) -> {
            if (f1.getDeleted() && !f2.getDeleted()) return 1;
            if (!f1.getDeleted() && f2.getDeleted()) return -1;
            return Integer.compare(f1.getOrderIndex(), f2.getOrderIndex());
        });

        existingForm.setFields(updatedFields);

        List<FormField> activeFields = updatedFields.stream()
                .filter(field -> !field.getDeleted())
                .collect(Collectors.toList());

        validateFields(activeFields);
    }

    private boolean isFieldMarkedForDeletion(List<UpdateFormRequestDTO.UpdateFormFieldDTO> fieldUpdates, Long fieldId) {
        return fieldUpdates.stream()
                .anyMatch(update -> fieldId.equals(update.getId()) && update.isDeleted());
    }



    private void updateFieldProperties(FormField field, UpdateFormRequestDTO.UpdateFormFieldDTO fieldUpdate) {
        if (fieldUpdate.getLabel() != null) {
            field.setLabel(fieldUpdate.getLabel());
        }
        if (fieldUpdate.getType() != null) {
            field.setType(FieldType.valueOf(fieldUpdate.getType()));
        }
        if (fieldUpdate.getRequired() != null) {
            field.setRequired(fieldUpdate.getRequired());
        } else {
            field.setRequired(false); // Default value
        }
        if (fieldUpdate.getPlaceholder() != null) {
            field.setPlaceholder(fieldUpdate.getPlaceholder());
        }
        if (fieldUpdate.getHelpText() != null) {
            field.setHelpText(fieldUpdate.getHelpText());
        }
        if (fieldUpdate.getOptions() != null) {
            field.setOptions(fieldUpdate.getOptions());
        }
    }


    private void updateFieldPropertiesMinor(FormField field, UpdateFormRequestDTO.UpdateFormFieldDTO fieldUpdate) {

        if (fieldUpdate.getLabel() != null) {
            field.setLabel(fieldUpdate.getLabel());
        }
        if (fieldUpdate.getPlaceholder() != null) {
            field.setPlaceholder(fieldUpdate.getPlaceholder());
        }
        if (fieldUpdate.getHelpText() != null) {
            field.setHelpText(fieldUpdate.getHelpText());
        }

        // Don't allow changing a field type or making required if responses exist
        if (fieldUpdate.getType() != null && !fieldUpdate.getType().equals(field.getType().name())) {
            throw new IllegalArgumentException("Cannot change field type for field with existing responses: " + field.getLabel());
        }

        if (fieldUpdate.getRequired() != null && fieldUpdate.getRequired() && !field.getRequired()) {
            throw new IllegalArgumentException("Cannot make field required when responses exist: " + field.getLabel());
        }

        if (fieldUpdate.getRequired() != null && !fieldUpdate.getRequired() && field.getRequired()) {
            field.setRequired(false);
        }

        // Allow updating options for dropdown/checkbox fields (but validate compatibility)
        if (fieldUpdate.getOptions() != null) {
            validateOptionsCompatibility(field, fieldUpdate.getOptions());
            field.setOptions(fieldUpdate.getOptions());
        }
    }


    private void validateOptionsCompatibility(FormField field, String newOptions) {
        if (field.getFieldResponses() == null || field.getFieldResponses().isEmpty()) {
            return; // No responses to validate against
        }

        Set<String> existingValues = field.getFieldResponses().stream()
                .filter(response -> !response.getIsDeleted() && response.getValue() != null)
                .map(FormFieldResponse::getValue)
                .collect(Collectors.toSet());

        if (existingValues.isEmpty()) {
            return; // No actual response values
        }

        Set<String> newOptionValues = parseOptions(newOptions);

        for (String existingValue : existingValues) {
            if (!newOptionValues.contains(existingValue)) {
                throw new IllegalArgumentException(
                        "Cannot remove option '" + existingValue + "' as it has existing responses in field: " + field.getLabel());
            }
        }
    }

    private Set<String> parseOptions(String options) {
        if (options == null || options.trim().isEmpty()) {
            return new HashSet<>();
        }

        try {
            // Try parsing as a JSON array first
            if (options.trim().startsWith("[")) {
                // Simple JSON array parsing - you might want to use Jackson here
                String[] values = options.trim()
                        .substring(1, options.length() - 1) // Remove [ and ]
                        .split(",");
                return Arrays.stream(values)
                        .map(s -> s.trim().replaceAll("\"", "")) // Remove quotes
                        .collect(Collectors.toSet());
            } else {
                // Comma-separated values
                return Arrays.stream(options.split(","))
                        .map(String::trim)
                        .collect(Collectors.toSet());
            }
        } catch (Exception e) {
            log.warn("Could not parse options for validation: {}", options);
            return new HashSet<>();
        }
    }






    public void deleteForm(Long eventId, Long formId, Users currentUser) {
        eventsRepo.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        RegistrationForm existingForm = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found with id: " + formId));

        if (!existingForm.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Form does not belong to the specified event");
        }

        if (!eventRoleService.hasAdministrativeRole(currentUser.getId(), eventId)) {
            throw new IllegalArgumentException("User does not have permission to delete forms for this event");
        }

        existingForm.setIsActive(false);
        existingForm.setInActivationBy(currentUser.getId());
        existingForm.setInActivationAt(LocalDateTime.now());
        registrationFormRepo.save(existingForm);

        log.info("Form {} soft deleted for event {} by user {}", formId, eventId, currentUser.getId());
    }

    public List<CreateFormResponseDTO> getActiveForm(Long eventId, Users currentUser) throws NoActiveFormsException {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        List<RegistrationForm> activeForms = registrationFormRepo.findAllByEventAndIsActiveTrue(event);


        if (activeForms.isEmpty()) {
            log.warn("No active forms found for event {} requested by user {}", eventId, currentUser.getId());
            throw new NoActiveFormsException("No active forms found for event: " + eventId);
        }

        List<CreateFormResponseDTO> responseDTOs = activeForms.stream()
                                                                .map(registrationFormMapper::toResponseDTO)
                                                                .collect(Collectors.toList());

        log.info("Retrieved active form for event {} by user {}", eventId, currentUser.getId());
        return responseDTOs;
    }

    public CreateFormResponseDTO getFormById(Long eventId, Long formId, Users currentUser) {
        eventsRepo.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found with id: " + formId));

        if (!form.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Form does not belong to the specified event");
        }

//        if(!eventRoleService.hasAdministrativeRole(currentUser.getId(), eventId) ) {
//            throw new IllegalArgumentException("User does not have permission to view All forms for this event");
//        }

        return registrationFormMapper.toResponseDTO(form);
    }
}
