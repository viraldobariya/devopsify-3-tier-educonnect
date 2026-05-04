package com.educonnect.event.controller;

import com.educonnect.auth.service.AuthService;
import com.educonnect.event.dto.response.EventResponseDto;
import com.educonnect.event.dto.response.PagedResponse;
import com.educonnect.event.dto.response.ViewRegistrationsDTO;
import com.educonnect.event.model.Events;
import com.educonnect.event.service.EventService;
import com.educonnect.event.utility.EventMapper;
import com.educonnect.user.entity.Users;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.Min;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@CrossOrigin
@Slf4j
@Tag(name = "Events", description = "Event management APIs")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AuthService authService;


    @Operation(summary = "Get all events with pagination", description = "Retrieve paginated list of events")
    @GetMapping("/")
    @Cacheable(value = "events", key = "#page + '_' + #size + '_' + #sortBy + '_' + #sortDirection")
    public ResponseEntity<PagedResponse<EventResponseDto>> getAllEvents(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ){


        log.info("Fetching events - page: {}, size: {}, sortBy: {}, sortDirection: {}",
                page, size, sortBy, sortDirection);

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page , size , Sort.by(direction, sortBy));


        PagedResponse<EventResponseDto> response = eventService.getAllEvents(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDto> getEventsById(@PathVariable Long id){
        Optional<Events> event = eventService.findEventById(id);
        if (event.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        EventResponseDto response = EventMapper.toEventResponseDto(event.get());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Search events", description = "Search events by keyword")
    @GetMapping("/search")
    @Cacheable(value = "eventSearch", key = "#keyWord + '_' + #page + '_' + #size")
    public ResponseEntity<PagedResponse<EventResponseDto>> searchEvents(@RequestParam String keyWord , @RequestParam(defaultValue = "0") @Min(0) int page,
                                                                       @RequestParam(defaultValue = "20") int size) {

        log.info("Searching events with keyword: {}", keyWord);
        Pageable pageable = PageRequest.of(page , size);
        PagedResponse<EventResponseDto> response = eventService.searchEvents(keyWord, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upcoming")
    @Cacheable(value = "events", key = "#page + '_' + #size + '_' + #sortBy + '_' + #sortDirection")
    public ResponseEntity<PagedResponse<EventResponseDto>> getUpcomingEvents(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ){
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page , size , Sort.by(direction, sortBy));

        PagedResponse<EventResponseDto> response = eventService.getUpcomingEvents(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/past")
    @Cacheable(value = "events", key = "#page + '_' + #size + '_' + #sortBy + '_' + #sortDirection")
    public ResponseEntity<PagedResponse<EventResponseDto>> getPastEvents(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ){
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<EventResponseDto> response = eventService.getPastEvents(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dateRange")
    @Cacheable(value = "events", key = "#startDate + '_' + #endDate + '_' + #page + '_' + #size + '_' + #sortBy + '_' + #sortDirection")
    public ResponseEntity<PagedResponse<EventResponseDto>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        if(startDate == null || endDate == null || startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }

        // Convert LocalDate to LocalDateTime (start of day for startDate, end of day for endDate)
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<EventResponseDto> response = eventService.getEventsByDateRange(startDateTime, endDateTime, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular")
    @Cacheable(value = "events", key = "#page + '_' + #size")
    public ResponseEntity<PagedResponse<EventResponseDto>> getPopularEvents(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // Create pageable without sorting since the query handles sorting by registration count
        Pageable pageable = PageRequest.of(page, size);

        PagedResponse<EventResponseDto> response = eventService.getPopularEvents(pageable);
        return ResponseEntity.ok(response);
    }

//    @GetMapping("/createdBy/{username}")
//    public ResponseEntity<List<EventResponseDto>> getEventsCreatedByUser(@PathVariable String username) {
//        try {
//            if (username == null) {
//                return ResponseEntity.badRequest().build();
//            }
//            List<EventResponseDto> response = eventService.findEventByCreator(username).stream()
//                    .map(EventMapper::toEventResponseDto)
//                    .toList();
//            return ResponseEntity.ok(response);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }

    @GetMapping("/my-created")
    @Cacheable(value = "events", key = "#page + '_' + #size + '_' + #sortBy + '_' + #sortDirection")
    public ResponseEntity<PagedResponse<EventResponseDto>> getMyCreatedEvents(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        try {
            if (request == null || response == null) {
                return ResponseEntity.badRequest().build();
            }

            Users currentUser = authService.me(request, response);
            Sort.Direction direction = Sort.Direction.fromString(sortDirection);
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            PagedResponse<EventResponseDto> responseList = eventService.getMyCreatedEvents(currentUser.getId(), pageable);

            return ResponseEntity.ok(responseList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PostMapping(path = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CacheEvict(value = {"events" , "eventSearch"} , allEntries = true)
    public ResponseEntity<EventResponseDto> addEvent(@RequestPart("Event")  Events event , @RequestPart(value = "file" , required = false) MultipartFile file, HttpServletRequest request, HttpServletResponse response) {
        try{
            Users currentUser = authService.me(request, response);
            Events savedEvent = eventService.addEvent(event , currentUser.getId() , file);
            EventResponseDto responseDto = EventMapper.toEventResponseDto(savedEvent);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
        }  catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CacheEvict(value = {"events" , "eventSearch"} , allEntries = true)
    public ResponseEntity<EventResponseDto> updateEvent(@PathVariable Long id,
                                                        @RequestPart("Event") Events event,
                                                        @RequestPart(value = "file", required = false) MultipartFile file,
                                                        HttpServletRequest request,
                                                        HttpServletResponse response) {
        try {
            Users currentUser = authService.me(request, response);
            Events updatedEvent = eventService.updateEvent(event, id, currentUser.getId() , file);
            EventResponseDto responseDto = EventMapper.toEventResponseDto(updatedEvent);
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = {"events" , "eventSearch"} , allEntries = true)
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response) {
        try {
            Users currentUser = authService.me(request, response);
            eventService.deleteEvent(id, currentUser.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/registration-count/{eventId}")
    public ResponseEntity<Long> getEventRegistrationCount(@PathVariable Long eventId) {
        try {
            long count = eventService.getEventRegistrationCount(eventId);
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/available-spots/{eventId}")
    public ResponseEntity<Long> getAvailableSpots(@PathVariable Long eventId) {
        try {
            long availableSpots = eventService.getAvailableSpots(eventId);
            return ResponseEntity.ok(availableSpots);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/is-full/{eventId}")
    public ResponseEntity<Boolean> isEventFull(@PathVariable Long eventId) {
        try {
            boolean isFull = eventService.isEventFull(eventId);
            return ResponseEntity.ok(isFull);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/is-active/{eventId}")
    public ResponseEntity<Boolean> isEventActive(@PathVariable Long eventId) {
        try {
            boolean isActive = eventService.isEventActive(eventId);
            return ResponseEntity.ok(isActive);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/total-count")
    public ResponseEntity<Long> getTotalEventsCount() {
        return ResponseEntity.ok(eventService.getTotalEventsCount());
    }

    @GetMapping("/total-active-count")
    public ResponseEntity<Long> getTotalActiveEventsCount() {
        return ResponseEntity.ok(eventService.getTotalActiveEventsCount());
    }

    @GetMapping("/creator-count/{creatorId}")
    public ResponseEntity<Long> getEventsByCreatorCount(@PathVariable UUID creatorId) {
        try {
            long count = eventService.getEventsByCreatorCount(creatorId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/is-creator/{id}")
    public ResponseEntity<Boolean> isUserEventCreator(@PathVariable Long id,
                                                      HttpServletRequest request, HttpServletResponse response) {
        try {
            log.info("Checking if user is creator for event ID: {}", id);
            Users currentUser = authService.me(request, response);
            log.info("Authenticated user: {}", currentUser.getId());
            boolean isCreator = eventService.isUserEventCreator(id, currentUser.getId());
            log.info("Is creator: {}", isCreator);
            return ResponseEntity.ok(isCreator);
        } catch (RuntimeException e) {
            log.error("Error checking event creator status", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/creator/{id}")
    public ResponseEntity<UUID> getEventCreator(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.getEventCreator(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/view/{id}/registrations")
    public ResponseEntity<ViewRegistrationsDTO> viewEventRegistrations(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response) {
        Users currentUser = authService.me(request, response);
        ViewRegistrationsDTO dto = eventService.viewEventRegistrations(id, currentUser.getId());
        return ResponseEntity.ok(dto);
    }




}
