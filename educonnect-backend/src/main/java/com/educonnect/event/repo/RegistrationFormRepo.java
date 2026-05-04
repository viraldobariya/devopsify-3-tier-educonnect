package com.educonnect.event.repo;

import com.educonnect.event.model.Events;
import com.educonnect.event.model.RegistrationForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationFormRepo extends JpaRepository<RegistrationForm, Long> {
    List<RegistrationForm> findByEvent(Events event);

    boolean existsByEventAndIsActiveTrue(Events event);

//    Optional<RegistrationForm> findByEventAndIsActiveTrue(Events event);

    List<RegistrationForm> findAllByEventAndIsActiveTrue(Events event);
}
