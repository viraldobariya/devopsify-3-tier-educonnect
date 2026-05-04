package com.educonnect.event.controller;

import com.educonnect.auth.service.AuthService;
import com.educonnect.event.dto.response.RegistrationDTO;
import com.educonnect.event.model.Registration;
import com.educonnect.event.service.RegistrationService;
import com.educonnect.exceptionhandling.exception.EventFullException;
import com.educonnect.exceptionhandling.exception.EventNotFoundException;
import com.educonnect.user.entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class RegistrationController {

    @Autowired
    private RegistrationService rService;

    @Autowired
    private AuthService authService;

    @PostMapping("/register/{eventId}")
    @CacheEvict(value = {"events", "eventSearch"}, allEntries = true)
    public ResponseEntity<RegistrationDTO> registerForEvent(@PathVariable Long eventId, HttpServletRequest request, HttpServletResponse response) {
        try {
            Users user = authService.me(request, response);
            Registration registration = rService.userRegister(eventId, user.getId());
            RegistrationDTO dto = RegistrationDTO.from(registration);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/events/{eventId}/unregister")
    @CacheEvict(value = {"events", "eventSearch"}, allEntries = true)
    public  ResponseEntity<Void> unregisterFromEvent(@PathVariable Long eventId, HttpServletRequest request, HttpServletResponse response) {
        try {
            Users user = authService.me(request, response);
            rService.removeRegistration(eventId, user.getId());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (EventNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/events/my-registrations")
    @CacheEvict(value = {"events" , "eventSearch"} , allEntries = true)
    public ResponseEntity<List<RegistrationDTO>> getMyRegistrations(HttpServletRequest request, HttpServletResponse response) {
        try {
            Users user = authService.me(request, response);
            List<RegistrationDTO> registrations = rService.getMyRegistration(user.getId());
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/events/{eventId}/registration-id")
    public ResponseEntity<Long> getRegistrationId(@PathVariable Long eventId, HttpServletRequest request, HttpServletResponse response) {
        try {
            Users user = authService.me(request, response);
            Long registrationId = rService.getRegistrationId(eventId, user.getId());
            return ResponseEntity.ok(registrationId);
        } catch (EventNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @GetMapping("/events/{eventId}/registration-status")
    public ResponseEntity<Long> getRegistrationStatus(@PathVariable Long eventId, HttpServletRequest request, HttpServletResponse response) {
        try {
            Users user = authService.me(request, response);
            Long status = rService.getRegistrationStatus(eventId, user.getId());
            return ResponseEntity.ok(status);
        } catch (EventNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<List<RegistrationDTO>> getEventRegistrations(@PathVariable Long eventId) {
        try {
            List<RegistrationDTO> registrations = rService.getEventRegistration(eventId);

            return ResponseEntity.ok(registrations);
        } catch (EventNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
