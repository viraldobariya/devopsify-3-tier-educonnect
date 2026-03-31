package com.educonnect.event.controller;

import com.educonnect.auth.service.AuthService;
import com.educonnect.event.dto.request.RegistrationRequestDTO;
import com.educonnect.event.dto.response.RegistrationResponseDTO;
import com.educonnect.event.service.FormSubmitService;
import com.educonnect.user.entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/forms/{formId}")
@CrossOrigin(origins = "*")
public class FormSubmitController {

    @Autowired
    private FormSubmitService formSubmitService;

    @Autowired
    private AuthService authService;

    @PostMapping(value = "/submit")
    public ResponseEntity<RegistrationResponseDTO> submitRegistration(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            @Valid @RequestBody RegistrationRequestDTO request,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) {

        try {

            Users currentUser = authService.me(httpServletRequest, httpServletResponse);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            RegistrationResponseDTO response = formSubmitService.registerUser(eventId, formId, request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    @GetMapping("/registration")
    public ResponseEntity<RegistrationResponseDTO> getUserRegistration(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) {

        try {
            Users currentUser = authService.me(httpServletRequest, httpServletResponse);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            RegistrationResponseDTO registration = formSubmitService.getUserRegistration(eventId, formId, currentUser);
            return ResponseEntity.ok(registration);
        }catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping(value = "/update")
    public ResponseEntity<RegistrationResponseDTO> updateRegistration(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            @Valid @RequestBody RegistrationRequestDTO request,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) {

        try {
            Users currentUser = authService.me(httpServletRequest, httpServletResponse);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            RegistrationResponseDTO response = formSubmitService.updateRegistration(eventId, formId, request, currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/cancel")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) {

        try {
            Users currentUser = authService.me(httpServletRequest, httpServletResponse);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            formSubmitService.cancelRegistration(eventId, formId, currentUser);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/check-eligibility")
    public ResponseEntity<String> checkRegistrationEligibility(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) {

        try {
            Users currentUser = authService.me(httpServletRequest, httpServletResponse);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String eligibilityStatus = formSubmitService.checkEligibility(eventId, formId, currentUser);
            return ResponseEntity.ok(eligibilityStatus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/get-answers")
    public ResponseEntity<List<RegistrationResponseDTO>> getFormAnswers(
            @PathVariable Long eventId,
            @PathVariable Long formId,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) {
        try {
            Users currentUser = authService.me(httpServletRequest, httpServletResponse);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            List<RegistrationResponseDTO> response = formSubmitService.getFormAnswers(eventId, formId, currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}