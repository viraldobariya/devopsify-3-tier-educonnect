package com.educonnect.event.repo;

import com.educonnect.event.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface TickerRepo extends JpaRepository<Ticket , Long> {

    Optional<Ticket> findByRegistrationIdAndCanGeneratePdfTrue(Long registrationId);
}
