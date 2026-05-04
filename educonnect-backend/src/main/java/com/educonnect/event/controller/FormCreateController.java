package com.educonnect.event.controller;


import com.educonnect.auth.service.AuthService;
import com.educonnect.event.dto.request.CreateFormRequestDTO;
import com.educonnect.event.dto.request.UpdateFormRequestDTO;
import com.educonnect.event.dto.response.CreateFormResponseDTO;
import com.educonnect.event.service.FormCreateService;
import com.educonnect.exceptionhandling.exception.EventNotFoundException;
import com.educonnect.exceptionhandling.exception.NoActiveFormsException;
import com.educonnect.user.entity.Users;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/forms")
@CrossOrigin
@Slf4j
@Tag(name = "Forms", description = "Form management APIs")
public class FormCreateController {

    private final FormCreateService formCreateService;

    private final AuthService  authService; // helper to get current user id

    public FormCreateController(FormCreateService formCreateService, AuthService authService) {
        this.formCreateService = formCreateService;
        this.authService = authService;
    }

    @PostMapping("/")
    public ResponseEntity<CreateFormResponseDTO> createForm(
            @PathVariable Long eventId,
            @RequestBody CreateFormRequestDTO formRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ){
        try {
            Users currentUser = authService.me(request, response);
            CreateFormResponseDTO savedForm = formCreateService.createForm(eventId, formRequest, currentUser);
            log.info("Form created successfully for event {} by user {}", eventId, currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedForm);
        } catch (IllegalArgumentException e) {
            log.error("Invalid input for creating form for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (EventNotFoundException e) {
            log.error("Error creating form for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

//    this Api for Admin Only, not for user
    @GetMapping("/")
    public ResponseEntity<List<CreateFormResponseDTO>> getAllForms(
            @PathVariable Long eventId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            Users currentUser = authService.me(request, response);

            List<CreateFormResponseDTO> forms = formCreateService.getAllFormsByEventId(eventId , currentUser);
            log.info("Retrieved {} forms for event {} by user {}",
                    forms.size(), eventId, currentUser.getId());
            return ResponseEntity.ok(forms);

        } catch (EventNotFoundException e) {
            log.error("Event {} not found when retrieving forms: {}", eventId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving forms for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{formId}")
    public ResponseEntity<CreateFormResponseDTO> updateForm(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            @RequestBody UpdateFormRequestDTO updateRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            Users currentUser = authService.me(request, response);
            CreateFormResponseDTO updatedForm = formCreateService.updateForm(eventId, formId, updateRequest, currentUser);

            log.info("Form {} updated successfully for event {} by user {}", formId, eventId, currentUser.getId());

            return ResponseEntity.ok(updatedForm);
        } catch (IllegalArgumentException e) {

            log.error("Invalid input for updating form {} in event {}: {}", formId, eventId, e.getMessage());

            return ResponseEntity.badRequest().build();
        } catch (EventNotFoundException e) {
            log.error("Event {} not found when updating form {}: {}", eventId, formId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating form {} for event {}: {}", formId, eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @DeleteMapping("/{formId}")
    public ResponseEntity<Void> deleteForm(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            Users currentUser = authService.me(request, response);
            formCreateService.deleteForm(eventId, formId, currentUser);

            log.info("Form {} deleted successfully for event {} by user {}", formId, eventId, currentUser.getId());

            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid input for deleting form {} in event {}: {}", formId, eventId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (EventNotFoundException e) {
            log.error("Event {} not found when deleting form {}: {}", eventId, formId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting form {} for event {}: {}", formId, eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{formId}")
    public ResponseEntity<CreateFormResponseDTO> getFormById(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            Users currentUser = authService.me(request, response);

            CreateFormResponseDTO form = formCreateService.getFormById(eventId, formId, currentUser);

            log.info("Retrieved form {} for event {} by user {}", formId, eventId, currentUser.getId());
            return ResponseEntity.ok(form);

        } catch (IllegalArgumentException e) {
            log.error("Invalid input for retrieving form {} in event {}: {}", formId, eventId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (EventNotFoundException e) {
            log.error("Event {} not found when retrieving form {}: {}", eventId, formId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving form {} for event {}: {}", formId, eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<CreateFormResponseDTO>> getActiveForm(
            @PathVariable Long eventId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            Users currentUser = authService.me(request, response);

            List<CreateFormResponseDTO> activeForm = formCreateService.getActiveForm(eventId, currentUser);

            log.info("Retrieved active form for event {} by user {}", eventId, currentUser.getId());
            return ResponseEntity.ok(activeForm);

        }catch (NoActiveFormsException e) {
            log.error("No active form found for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (EventNotFoundException e) {
            log.error("Event {} not found when retrieving active form: {}", eventId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving active form for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}