package com.educonnect.event.repo;

import com.educonnect.event.model.Events;
import com.educonnect.user.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;


@Repository
public interface EventsRepo extends JpaRepository<Events, Long> {

    @Query("SELECT e FROM Events e WHERE e.title ILIKE %:keyWord% OR e.description ILIKE %:keyWord% OR e.university ILIKE %:keyWord% OR CAST(e.startDate AS string) ILIKE %:keyWord% OR CAST(e.endDate AS string) ILIKE %:keyWord%")
    Page<Events> searchEvents(@Param("keyWord") String keyWord, Pageable pageable);

//    List<Events> findByDateAfterOrderByDateDesc(Date date);

    @Query("SELECT e FROM Events e ORDER BY CASE WHEN e.endDate >= CURRENT_TIMESTAMP THEN 0 ELSE 1 END, CASE WHEN e.endDate >= CURRENT_TIMESTAMP THEN e.startDate ELSE e.endDate END DESC")
    Page<Events> getAllEvents(Pageable pageable);

    List<Events> findByCreatedBy(Users user);

//    List<Events> findByDateBeforeOrderByDateDesc(Date date);
    List<Events> findByStartDateBeforeOrderByStartDateDesc(LocalDateTime date);
    Page<Events> findByStartDateBeforeOrderByStartDateDesc(LocalDateTime date, Pageable pageable);

    List<Events> findByStartDateBetweenOrderByStartDateAsc(LocalDateTime startDate, LocalDateTime endDate);
    Page<Events> findByStartDateBetweenOrderByStartDateAsc(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);


//    @Query("SELECT e FROM Events e LEFT JOIN e.registrations r GROUP BY e ORDER BY COUNT(r) DESC")
//    List<Events> findTopEventsByRegistrationCount(Pageable pageable);

    @Query("SELECT e FROM Events e LEFT JOIN e.registrations r WHERE e.endDate > CURRENT_TIMESTAMP GROUP BY e ORDER BY COUNT(r) / e.maxParticipants DESC")
    Page<Events> findTopEventsByRegistrationCountPaged(Pageable pageable);

    List<Events> findByCreatedByOrderByCreatedAtDesc(Users user);
    Page<Events> findByCreatedByOrderByCreatedAtDesc(Users user, Pageable pageable);

    long countByStartDateAfter(LocalDateTime date);

    long countByCreatedBy(Users creator);

    Page<Events> findByStartDateAfterOrderByStartDateAsc(LocalDateTime date , Pageable pageable);
}
