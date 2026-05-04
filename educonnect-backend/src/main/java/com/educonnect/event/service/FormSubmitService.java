package com.educonnect.event.service;

import com.educonnect.event.dto.request.RegistrationRequestDTO;
import com.educonnect.event.dto.response.RegistrationResponseDTO;
import com.educonnect.event.enums.FieldType;
import com.educonnect.event.model.*;
import com.educonnect.event.repo.*;
import com.educonnect.event.utility.SubmitFormMapper;
import com.educonnect.user.entity.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class FormSubmitService {

    @Autowired
    private EventsRepo eventsRepo;

    @Autowired
    private RegistrationFormRepo registrationFormRepo;

    @Autowired
    private FormFieldRepo formFieldRepo;

    @Autowired
    private RegistrationRepo registrationRepo;

    @Autowired
    private FormResponseRepo formResponseRepo;

    @Autowired
    private FormFieldResponseRepo formFieldResponseRepo;

    @Autowired
    private EventService eventService;

    @Autowired
    private SubmitFormMapper submitFormMapper;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Transactional
    public RegistrationResponseDTO registerUser(Long eventId, Long formId,
                                                RegistrationRequestDTO request, Users currentUser) {

        // Validate event and form existence
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found with id: " + formId));

        // Validate form belongs to event
        if (!form.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Form with id " + formId + " does not belong to event with id " + eventId);
        }

        // Validate form is active and deadline hasn't passed
        LocalDateTime now = LocalDateTime.now();
        if (!Boolean.TRUE.equals(form.getIsActive())) {
            throw new IllegalArgumentException("Form is not active for submissions");
        }

        if (form.getDeadline() != null && form.getDeadline().isBefore(now)) {
            throw new IllegalArgumentException("Form submission deadline has passed");
        }

        // Validate event hasn't started
        if (event.getStartDate().isBefore(now)) {
            throw new IllegalArgumentException("Event has already started, registration is closed");
        }

        // Check event capacity
        if (event.getMaxParticipants() != null && event.getMaxParticipants() > 0) {
            long currentParticipants = registrationRepo.countByEventAndFormSubmittedTrue(event);
            if (currentParticipants >= event.getMaxParticipants()) {
                throw new IllegalArgumentException("Event registration is full. No available spots remaining");
            }
        }


        if(form.getMaxResponses() != null && form.getMaxResponses() > 0){
            long currentFormResponses = registrationRepo.countByEventAndRegistrationFormAndFormSubmittedTrue(event, form);
            if(currentFormResponses >= form.getMaxResponses()){
                throw new IllegalArgumentException("Form has reached its maximum number of responses");
            }
        }
        // Check for existing registration
        Optional<Registration> existingRegOpt = registrationRepo.findByEventAndUser(event, currentUser);

        // If user already has a submitted registration, throw error
        if (existingRegOpt.isPresent()) {
            Registration existingReg = existingRegOpt.get();
            if (Boolean.TRUE.equals(existingReg.getFormSubmitted())) {
                throw new IllegalArgumentException("User already has a submitted registration for this event");
            }
        }

        // Validate form fields
        validateFormFields(form, request.getResponses());

        Registration registration;
        FormResponse formResponse;

        if (existingRegOpt.isEmpty()) {
            registration = createNewRegistration(event, form, currentUser);
            formResponse = createNewFormResponse(form, currentUser);
        } else {
            // Update existing (but not submitted) registration
            registration = existingRegOpt.get();
            registration.setRegistrationForm(form);
            registration.setStatusUpdatedAt(now);
            registration = registrationRepo.save(registration);

            // Get or create form response
            formResponse = registration.getFormResponse();
            if (formResponse == null) {
                formResponse = createNewFormResponse(form, currentUser);
            } else {
                // Reactivate soft-deleted form response if needed
                if (Boolean.TRUE.equals(formResponse.getIsDeleted())) {
                    formResponse.setIsDeleted(false);
                    formResponseRepo.save(formResponse);
                }
                // Note: Don't soft delete existing field responses here - let createFieldResponses handle reactivation
            }
        }

        List<FormFieldResponse> createdResponses = createFieldResponses(request.getResponses(), formResponse, form);
        formResponse.setFieldResponses(createdResponses);
        formResponse.setSubmittedAt(now);
        formResponseRepo.save(formResponse);

        // Mark registration as submitted and link form response
        registration.markFormAsSubmitted(formResponse);
        registration.setStatusUpdatedAt(now);
        registration = registrationRepo.save(registration);

        // Update formLimitEnabled after successful registration
        updateFormLimitEnabled(form, event);

        return submitFormMapper.mapToResponseDTO(registration);
    }

    // Helper method to create new registration
    private Registration createNewRegistration(Events event, RegistrationForm form, Users user) {
        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setRegistrationForm(form);
        registration.setUser(user);
        return registrationRepo.save(registration);
    }

    // Helper method to create new form response
    private FormResponse createNewFormResponse(RegistrationForm form, Users user) {
        FormResponse formResponse = new FormResponse();
        formResponse.setForm(form);
        formResponse.setParticipant(user);
//        formResponse.setCreatedAt(LocalDateTime.now());
//        formResponse.setUpdatedAt(LocalDateTime.now());
        return formResponseRepo.save(formResponse);
    }

    // Helper method to soft delete existing field responses
    private void softDeleteExistingFieldResponses(FormResponse formResponse) {
        if (formResponse.getFieldResponses() != null) {
            for (FormFieldResponse existingResponse : formResponse.getFieldResponses()) {
                if (!Boolean.TRUE.equals(existingResponse.getIsDeleted())) {
                    existingResponse.setIsDeleted(true);
//                    existingResponse.setUpdatedAt(LocalDateTime.now());
                    formFieldResponseRepo.save(existingResponse);
                }
            }
        }
    }

    // Helper method to create field responses
    private List<FormFieldResponse> createFieldResponses(
            List<RegistrationRequestDTO.RegistrationFieldDTO> requestResponses,
            FormResponse formResponse,
            RegistrationForm form) {

        List<FormFieldResponse> createdResponses = new ArrayList<>();

        for (RegistrationRequestDTO.RegistrationFieldDTO responseDto : requestResponses) {
            FormField field = formFieldRepo.findById(responseDto.getFieldId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Field not found with id: " + responseDto.getFieldId()));

            // Validate field belongs to the form
            if (!field.getForm().getId().equals(form.getId())) {
                throw new IllegalArgumentException(
                        "Field with id " + responseDto.getFieldId() + " does not belong to form with id " + form.getId());
            }

            if (Boolean.TRUE.equals(field.getDeleted())) {
                continue;
            }

            // Check for existing response (including soft-deleted ones)
            Optional<FormFieldResponse> existingResponseOpt = formFieldResponseRepo.findByResponseAndField(formResponse, field);
            FormFieldResponse response;

            if (existingResponseOpt.isPresent()) {
                // Update existing response (whether it's active or soft-deleted)
                response = existingResponseOpt.get();
                response.setValue(responseDto.getValue());
                response.setIsDeleted(false); // Reactivate if it was soft-deleted
            } else {
                // Create new response only if none exists
                response = new FormFieldResponse();
                response.setResponse(formResponse);
                response.setField(field);
                response.setValue(responseDto.getValue());
                response.setIsDeleted(false);
            }
            createdResponses.add(formFieldResponseRepo.save(response));
        }

        return createdResponses;
    }

    // Enhanced getUserRegistration method
    public RegistrationResponseDTO getUserRegistration(Long eventId, Long formId, Users currentUser) {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found with id: " + formId));

        if (!form.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Form does not belong to the specified event");
        }

        Registration registration = registrationRepo
                .findByEventAndUser(event, currentUser)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No registration found for user in the specified event"));



        // Check if form is submitted and belongs to the requested form
//        if (!Boolean.TRUE.equals(registration.getFormSubmitted())) {
//            throw new IllegalArgumentException("Form submission not completed for this registration");
//        }

        if (registration.getRegistrationForm() == null ||
                !registration.getRegistrationForm().getId().equals(form.getId())) {
            throw new IllegalArgumentException("No registration found for the specified form");
        }

        return submitFormMapper.mapToResponseDTO(registration);
    }






    @Transactional
    public RegistrationResponseDTO updateRegistration(Long eventId, Long formId,
                                                      RegistrationRequestDTO request, Users currentUser) {

        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));

        Registration registration = (Registration) registrationRepo
                .findByEventAndUserAndFormSubmittedIsTrue(event , currentUser)
                .orElseThrow(() -> new IllegalArgumentException("No registration found to update"));

        if (registration.getRegistrationForm() == null || !registration.getRegistrationForm().getId().equals(form.getId())) {
            throw new IllegalArgumentException("No registration found for this form");
        }

        if (!form.getIsActive() || form.getDeadline().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot update registration - form deadline passed or inactive");
        }

        validateFormFields(form, request.getResponses());

        FormResponse formResponse = registration.getFormResponse();
        if (formResponse == null) {
            formResponse = new FormResponse();
            formResponse.setForm(form);
            formResponse.setParticipant(currentUser);
            formResponse = formResponseRepo.save(formResponse);
        }

        // Use the helper method that handles update/create logic
        List<FormFieldResponse> updatedResponses = createFieldResponses(request.getResponses(), formResponse, form);
        formResponse.setFieldResponses(updatedResponses);
        formResponse.setSubmittedAt(LocalDateTime.now());
        formResponseRepo.save(formResponse);

        registration.markFormAsSubmitted(formResponse);
        registration.setStatusUpdatedAt(LocalDateTime.now());
        registration = registrationRepo.save(registration);

        return submitFormMapper.mapToResponseDTO(registration);
    }

    @Transactional
    public void cancelRegistration(Long eventId, Long formId, Users currentUser) {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));

        Registration registration = registrationRepo
                .findByEventAndUser(event, currentUser)
                .orElseThrow(() -> new IllegalArgumentException("No registration found to cancel"));

        if (registration.getRegistrationForm() == null || !registration.getRegistrationForm().getId().equals(form.getId())) {
            throw new IllegalArgumentException("No registration found for this form");
        }

        if (event.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot cancel registration - event already started");
        }
        if(!registration.getFormSubmitted()){
            throw new IllegalArgumentException("Cannot cancel registration - form not submitted yet");
        }


        // Soft delete form response and its field responses
        FormResponse formResponse = registration.getFormResponse();
        if (formResponse != null) {
            // Soft delete individual field responses
            if (formResponse.getFieldResponses() != null) {
                for (FormFieldResponse fieldResponse : formResponse.getFieldResponses()) {
                    if (!Boolean.TRUE.equals(fieldResponse.getIsDeleted())) {
                        fieldResponse.setIsDeleted(true);
                        formFieldResponseRepo.save(fieldResponse);
                    }
                }
            }
            // Soft delete the form response itself
            formResponse.setIsDeleted(true);
            formResponseRepo.save(formResponse);
        }

        registration.setFormSubmitted(false);
        registrationRepo.save(registration);

        // Update formLimitEnabled after cancellation using utility method
        updateFormLimitEnabled(form, event);
    }

    public String checkEligibility(Long eventId, Long formId, Users currentUser) {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));

        if (!form.getIsActive()) {
            return "INELIGIBLE: Form is not active";
        }

        if (form.getDeadline().isBefore(LocalDateTime.now())) {
            return "INELIGIBLE: Registration deadline has passed";
        }

        if (event.getStartDate().isBefore(LocalDateTime.now())) {
            return "INELIGIBLE: Event already started";
        }

        Optional<Registration> existing = registrationRepo.findByEventAndUser(event, currentUser);
        if (existing.isPresent() && Boolean.TRUE.equals(existing.get().getFormSubmitted())) {
            return "INELIGIBLE: Already registered for this event";
        }

        if (event.getMaxParticipants() != null) {
            // Count only fully submitted registrations
            long activeRegistrations = registrationRepo.findByEvent(event).stream()
                    .filter(r -> Boolean.TRUE.equals(r.getFormSubmitted()))
                    .count();
            if (activeRegistrations >= event.getMaxParticipants()) {
                return "INELIGIBLE: Event is full";
            }
        }

        return "ELIGIBLE";
    }

    private void validateFormFields(RegistrationForm form, List<RegistrationRequestDTO.RegistrationFieldDTO> responses) {
        List<FormField> activeFields = (form.getFields() == null) ? List.of() :
                form.getFields().stream().filter(f -> !Boolean.TRUE.equals(f.getDeleted())).toList();

        for (RegistrationRequestDTO.RegistrationFieldDTO responseDto : responses) {
            Optional<FormField> fieldOpt = formFieldRepo.findById(responseDto.getFieldId());
            if (fieldOpt.isEmpty()) {
                throw new IllegalArgumentException("Invalid field ID: " + responseDto.getFieldId());
            }

            FormField field = fieldOpt.get();

            if (Boolean.TRUE.equals(field.getDeleted())) {
                continue; // Ignore deleted fields
            }

            if (!field.getForm().getId().equals(form.getId())) {
                throw new IllegalArgumentException("Field does not belong to this form");
            }

            // Required field validation
            if (Boolean.TRUE.equals(field.getRequired()) && (responseDto.getValue() == null || responseDto.getValue().trim().isEmpty())) {
                throw new IllegalArgumentException("Required field missing: " + field.getLabel());
            }

            // Type validation
            if (responseDto.getValue() != null && !responseDto.getValue().trim().isEmpty()) {
                validateFieldValue(field, responseDto.getValue());
            }
        }

        // Check if all required fields are provided
        for (FormField field : activeFields) {
            if (Boolean.TRUE.equals(field.getRequired())) {
                boolean found = responses.stream()
                        .anyMatch(r -> r.getFieldId().equals(field.getId()) &&
                                r.getValue() != null && !r.getValue().trim().isEmpty());
                if (!found) {
                    throw new IllegalArgumentException("Required field missing: " + field.getLabel());
                }
            }
        }
    }

    private void validateFieldValue(FormField field, String value) {
        FieldType type = field.getType();
        if (type == null) return;
        switch (type) {
            case EMAIL:
                if (!EMAIL_PATTERN.matcher(value).matches()) {
                    throw new IllegalArgumentException("Invalid email format for field: " + field.getLabel());
                }
                break;
            case NUMBER:
                try {
                    Long.parseLong(value);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Invalid number format for field: " + field.getLabel());
                }
                break;
            case DROPDOWN:
            case RADIO:
            case CHECKBOX:
                if (field.getOptions() != null) {
                    List<String> allowedOptions = Arrays.stream(
                                    field.getOptions().replaceAll("[\\[\\]\"]", "").split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .toList();

                    if (!allowedOptions.contains(value)) {
                        throw new IllegalArgumentException("Invalid option for field " + field.getLabel() + ": " + value);
                    }
                }
                break;
            default:
                // TEXT, TEXTAREA, DATE, PHONE etc. basic non-empty validation already handled by required check
                break;
        }
    }


    void updateFormLimitEnabled(RegistrationForm form, Events event) {
        if (form.getMaxResponses() != null && form.getMaxResponses() > 0) {
            long currentFormResponses = registrationRepo.countByEventAndRegistrationFormAndFormSubmittedTrue(event, form);
            boolean shouldBeEnabled = currentFormResponses >= form.getMaxResponses();
            form.setFormLimitEnabled(shouldBeEnabled);
            registrationFormRepo.save(form);
        } else {
            form.setFormLimitEnabled(false);
            registrationFormRepo.save(form);
        }
    }

    public List<RegistrationResponseDTO> getFormAnswers(Long eventId, Long formId, Users currentUser) {
        Events event = eventsRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));

        RegistrationForm form = registrationFormRepo.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found with id: " + formId));

        if (!form.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Form does not belong to the specified event");
        }

        if(currentUser != event.getCreatedBy()){
            throw new IllegalArgumentException("Only event creator can access form answers");
        }

        List<Registration> registrations = registrationRepo.findByEventAndRegistrationFormAndFormSubmittedTrue(event, form);
        if (registrations.isEmpty()) {
            throw new IllegalArgumentException("No registrations found for this form");
        }
        // For simplicity, return the first registration's responses
        return registrations.stream()
                .map(submitFormMapper::mapToResponseDTO)
                .toList();
    }
}
