package com.educonnect.event.service;

import com.educonnect.event.dto.response.EventResponseDto;
import com.educonnect.event.dto.response.PagedResponse;
import com.educonnect.event.dto.response.ViewRegistrationsDTO;
import com.educonnect.event.enums.EventRoleType;
import com.educonnect.event.model.EventRole;
import com.educonnect.event.model.Events;
import com.educonnect.event.repo.EventsRepo;
import com.educonnect.event.repo.RegistrationRepo;
import com.educonnect.event.repo.EventRoleRepo;
import com.educonnect.event.utility.EventMapper;
import com.educonnect.exceptionhandling.exception.EventNotFoundException;
import com.educonnect.exceptionhandling.exception.FileUploadException;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import com.educonnect.utils.aws.s3.S3FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventService {

    private final EventsRepo erepo;

    private final S3FileUploadUtil s3FileUploadUtil;

    private final RegistrationRepo repo;

    private final UserRepository uRepo;

    private final ApplicationEventPublisher applicationEventPublisher;

    private final EventRoleRepo eventRoleRepo;



//    @Cacheable(value = "events", key = "#pageable.pageNumber + '_' + #pageable.pageSize + '_' + #pageable.sort")
    public PagedResponse<EventResponseDto> getAllEvents(Pageable pageable) {
        log.info("Fetching all events with pagination: {}", pageable);
        Page<Events> eventsPage = erepo.getAllEvents(pageable);
        List<EventResponseDto> eventDtos = eventsPage.getContent().stream()
                .map(EventMapper::toEventResponseDto)
                .toList();
        return PagedResponse.<EventResponseDto>builder()
                .content(eventDtos)
                .page(eventsPage.getNumber())
                .size(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .build();
    }


    public Optional<Events> findEventById(Long eventId){
        return erepo.findById(eventId);
    }



    public Events addEvent(Events event , UUID userId , MultipartFile file) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }

        Users creator = uRepo.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));

        event.setCreatedBy(creator);
        if(file != null) {

            if(file.getSize() > 1024 * 1024 * 5){
                throw new FileUploadException("File size should be less than 5MB.");
            }

            String bannerUrl;

            try {
                bannerUrl = s3FileUploadUtil.uploadImage(file);
            } catch (Exception ex) {
                throw new FileUploadException("Something happened while uploading file.");
            }
            event.setBannerUrl(bannerUrl);

        }


        EventRole creatorRole = EventRole.builder()
                .event(event)
                .user(creator)
                .role(EventRoleType.CREATOR)
                .build();


        if(event.getEventRoles() != null){
            event.getEventRoles().add(creatorRole);
        } else {
            event.setEventRoles(List.of(creatorRole));
        }

        validateEventData(event);

        applicationEventPublisher.publishEvent(
                new EventCreatedDomainEvent(event.getId(), userId)
        );

        return erepo.save(event);
    }

    private void validateEventData(Events event) {
        if(event.getTitle() == null || event.getTitle().trim().isEmpty()){
            throw new IllegalArgumentException("Event title cannot be empty");
        }

        if(event.getStartDate() == null || event.getEndDate() == null){
            throw new IllegalArgumentException("Event start date and end date cannot be null");
        }
        if(event.getStartDate().isBefore(LocalDateTime.now()) || event.getEndDate().isBefore(LocalDateTime.now())){
            throw new IllegalArgumentException("Event start date and end date cannot be in the past");
        }

        if(event.getMaxParticipants() <= 0){
            throw new IllegalArgumentException("Maximum participants must be greater than 0");
        }
    }

    public Events updateEvent(Events newEvent , Long id , UUID userId , MultipartFile file) {
        Events crrEvent = erepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + id)
        );

        if(!crrEvent.getCreatedBy().getId().equals(userId)){
            throw new IllegalArgumentException("You can only update events which created by you.");
        }

        if(file != null) {

            if(file.getSize() > 1024 * 1024 * 5){
                throw new FileUploadException("File size should be less than 5MB.");
            }

            String bannerUrl;

            try {
                bannerUrl = s3FileUploadUtil.uploadImage(file);
            } catch (Exception ex) {
                throw new FileUploadException("Something happened while uploading file.");
            }
            crrEvent.setBannerUrl(bannerUrl);

        }


        crrEvent.setTitle(newEvent.getTitle());
        crrEvent.setDescription(newEvent.getDescription());
        crrEvent.setUniversity(newEvent.getUniversity());
        crrEvent.setStartDate(newEvent.getStartDate());
        crrEvent.setEndDate(newEvent.getEndDate());
        crrEvent.setLocation(newEvent.getLocation());
        crrEvent.setMaxParticipants(newEvent.getMaxParticipants());
        crrEvent.setBannerUrl(newEvent.getBannerUrl());
        crrEvent.setAttachmentUrl(newEvent.getAttachmentUrl());
        validateEventData(crrEvent);

        return erepo.save(crrEvent);
    }

    public void deleteEvent(Long id , UUID userId) {
        Events event = erepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + id)
        );

        if(!event.getCreatedBy().getId().equals(userId)){
            throw new IllegalArgumentException("You can only update events which created by you.");
        }

        erepo.deleteById(id);
    }

    @Cacheable(value = "eventSearch", key = "#keyWord + '_' + #pageable.pageNumber + '_' + #pageable.pageSize ")
    public PagedResponse<EventResponseDto> searchEvents(String keyWord , Pageable pageable) {
        log.info("Searching events with keyword: {}", keyWord);

        if (!StringUtils.hasText(keyWord)) {
            return getAllEvents(pageable);
        }

//        if(keyWord == null || keyWord.trim().isEmpty()){
//            return getAllEvents();
//        }

        Page<Events> eventsPage = erepo.searchEvents(keyWord, pageable);
        List<EventResponseDto> eventdtoli = eventsPage.getContent().stream().map(EventMapper::toEventResponseDto).toList();

        return PagedResponse.<EventResponseDto>builder()
                .content(eventdtoli)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .empty(eventsPage.isEmpty())
                .build();
    }

    public PagedResponse<EventResponseDto> getUpcomingEvents(Pageable pageable){
        Page<Events> eventsPage = erepo.findByStartDateAfterOrderByStartDateAsc(LocalDateTime.now(), pageable);
        List<EventResponseDto> eventDtos = eventsPage.getContent().stream()
                .map(EventMapper::toEventResponseDto)
                .toList();
        return PagedResponse.<EventResponseDto>builder()
                .content(eventDtos)
                .page(eventsPage.getNumber())
                .size(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .build();
    }

//    public List<Events> findEventByCreator(String username){
//        List<Users> user = uRepo.findByUsername(username);
////                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));;
//
//
//        return erepo.findByCreatedBy(user);
//    }

    public List<Events> getPastEvents(){
        return erepo.findByStartDateBeforeOrderByStartDateDesc(LocalDateTime.now());
    }

    public PagedResponse<EventResponseDto> getPastEvents(Pageable pageable){
        Page<Events> eventsPage = erepo.findByStartDateBeforeOrderByStartDateDesc(LocalDateTime.now(), pageable);
        List<EventResponseDto> eventDtos = eventsPage.getContent().stream()
                .map(EventMapper::toEventResponseDto)
                .toList();
        return PagedResponse.<EventResponseDto>builder()
                .content(eventDtos)
                .page(eventsPage.getNumber())
                .size(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .build();
    }

    public List<Events> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate){
            return erepo.findByStartDateBetweenOrderByStartDateAsc(startDate, endDate);
    }

    public PagedResponse<EventResponseDto> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable){
        Page<Events> eventsPage = erepo.findByStartDateBetweenOrderByStartDateAsc(startDate, endDate, pageable);
        List<EventResponseDto> eventDtos = eventsPage.getContent().stream()
                .map(EventMapper::toEventResponseDto)
                .toList();
        return PagedResponse.<EventResponseDto>builder()
                .content(eventDtos)
                .page(eventsPage.getNumber())
                .size(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .build();
    }

    public long getEventRegistrationCount(Long eventId){
        Events event = erepo.findById(eventId).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + eventId)
        );

        return event.getCurrentParticipantCount();
    }

    public Long getAvailableSpots(Long eventId){
        Events event = erepo.findById(eventId).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + eventId)
        );

        return event.getMaxParticipants() - repo.countByEventIdAndFormSubmittedTrue(eventId);
    }

    public boolean isEventFull(Long eventId){
        Events event = erepo.findById(eventId).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + eventId)
        );

        return event.isFull();
    }

    public boolean isEventActive(Long eventId){
        Events event = erepo.findById(eventId).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + eventId)
        );
        return event.getStartDate().isAfter(LocalDateTime.now());
    }


    public PagedResponse<EventResponseDto> getPopularEvents(Pageable pageable){
        Page<Events> eventsPage = erepo.findTopEventsByRegistrationCountPaged(pageable);
        List<EventResponseDto> eventDtos = eventsPage.getContent().stream()
                .map(EventMapper::toEventResponseDto)
                .toList();
        return PagedResponse.<EventResponseDto>builder()
                .content(eventDtos)
                .page(eventsPage.getNumber())
                .size(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .build();
    }

    public List<Events> getMyCreatedEvents(UUID userId){
        Users user = uRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return erepo.findByCreatedByOrderByCreatedAtDesc(user);
    }

    public PagedResponse<EventResponseDto> getMyCreatedEvents(UUID userId, Pageable pageable){
        Users user = uRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Page<Events> eventsPage = erepo.findByCreatedByOrderByCreatedAtDesc(user, pageable);
        List<EventResponseDto> eventDtos = eventsPage.getContent().stream()
                .map(EventMapper::toEventResponseDto)
                .toList();
        return PagedResponse.<EventResponseDto>builder()
                .content(eventDtos)
                .page(eventsPage.getNumber())
                .size(eventsPage.getSize())
                .totalElements(eventsPage.getTotalElements())
                .totalPages(eventsPage.getTotalPages())
                .first(eventsPage.isFirst())
                .last(eventsPage.isLast())
                .build();
    }

    public long getTotalEventsCount(){
        return erepo.count();
    }

    public long getTotalActiveEventsCount(){
        return erepo.countByStartDateAfter(LocalDateTime.now());
    }

    public long getEventsByCreatorCount(UUID creatorId){
        Users user = uRepo.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + creatorId));
        return erepo.countByCreatedBy(user);
    }

    public boolean isUserEventCreator(Long eventId, UUID userId){
        Events event = erepo.findById(eventId).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + eventId)
        );
        return event.getCreatedBy().getId().equals(userId);
    }

    public UUID getEventCreator(Long eventId){
        Events event = erepo.findById(eventId).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + eventId)
        );
        return event.getCreatedBy().getId();
    }

    @Transactional(readOnly = true)
    public ViewRegistrationsDTO viewEventRegistrations(Long id, UUID userId) {
        Events event = erepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("Event not found with id: " + id)
        );

        boolean isCreator = event.getCreatedBy().getId().equals(userId);
        var eventRole = eventRoleRepo.findByUserIdAndEventId(userId, id);
        boolean hasPrivilegedRole = false;
        if(eventRole != null){
            switch (eventRole.getRole()){
                case CREATOR, ORGANIZER, MODERATOR, ADMIN -> hasPrivilegedRole = true;
                default -> hasPrivilegedRole = false;
            }
        }

        if(!(isCreator || hasPrivilegedRole)){
            throw new AccessDeniedException("You are not allowed to view registrations for this event.");
        }

        Long registrationCount = repo.countByEventIdAndFormSubmittedTrue(id);

        ViewRegistrationsDTO response = new ViewRegistrationsDTO();
        response.setEventTitle(event.getTitle());
        response.setRegistrationCount(registrationCount);

        List<Users> registeredUsers = repo.findRegisteredUsersByEventIdAndFormSubmittedTrue(id);


        List<ViewRegistrationsDTO.RegistrationDetail> registrationDetails = registeredUsers.stream()
                .map(user -> new ViewRegistrationsDTO.RegistrationDetail(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getAvatar()
                ))
                .toList();

        response.setRegistrations(registrationDetails);

        return response;
    }
}

