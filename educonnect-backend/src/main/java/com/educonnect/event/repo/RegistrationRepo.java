package com.educonnect.event.repo;

import com.educonnect.event.model.Events;
import com.educonnect.event.model.Registration;
import com.educonnect.event.model.RegistrationForm;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface RegistrationRepo extends JpaRepository<Registration, Long> {
    int countByEventId(Long eventId);

    boolean existsByEventAndUser(Events event, Users user);

    Optional<Registration> findByEventAndUser(Events event, Users user);

    List<Registration> findByUser(Users user);

    List<Registration> findByEvent(Events event);

    boolean existsByUserIdAndEventId(UUID userId, Long eventId);


    long countByEventAndFormSubmittedTrue(Events event);

    Optional<Object> findByEventAndUserAndFormSubmittedIsTrue(Events event, Users user);

    Long countByEventIdAndFormSubmittedTrue(Long eventId);


    List<Registration> findByUserAndFormSubmittedIsTrue(Users user);

    long countByEventAndRegistrationFormAndFormSubmittedTrue(Events event, RegistrationForm form);

    @Query("SELECT r.user FROM Registration r WHERE r.event.id = :eventId AND r.formSubmitted = true")
    List<Users> findRegisteredUsersByEventIdAndFormSubmittedTrue(@Param("eventId") Long eventId);

    List<Registration> findByEventAndRegistrationFormAndFormSubmittedTrue(Events event, RegistrationForm form);
}
