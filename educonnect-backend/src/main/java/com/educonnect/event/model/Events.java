package com.educonnect.event.model;

import com.educonnect.user.entity.Users;
import com.educonnect.event.enums.EventStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import jakarta.validation.constraints.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "events")
public class Events {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 300, columnDefinition = "VARCHAR(300)")
    @Size(max = 300)
    private String title;

    // Use large VARCHAR instead of CLOB/TEXT to prevent OID-based Clob retrieval issues
    @NotBlank
    @Size(max = 8000)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 8000, columnDefinition = "VARCHAR(8000)")
    private String description;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime startDate;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime endDate;

    @NotBlank
    @Column(nullable = false, length = 500, columnDefinition = "VARCHAR(500)")
    @Size(max = 500)
    private String location; // Physical address or online link

    @Column(length = 2048)
    private String bannerUrl; // Optional banner image

    @Column(length = 2048)
    private String attachmentUrl; // Optional attachment file

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.DRAFT;

    @Size(max = 100)
    @Column(length = 100)
    private String university;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Long maxParticipants;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Users createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventRole> eventRoles;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RegistrationForm> registrationForms;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Registration> registrations;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        validateChronology();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        validateChronology();
    }

    private void validateChronology() {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Event endDate cannot be before startDate");
        }
    }

    @PostUpdate
    protected void afterUpdate() {
        if (EventStatus.PUBLISHED.equals(this.status) && registrations != null) {
            for (Registration reg : registrations) {
                if(reg.getTicket() != null){
                    reg.getTicket().syncWithEvent();
                }
            }
        }
    }
    // Business logic methods
    public long getCurrentParticipantCount() {
        return registrations != null ? registrations.size() : 0;
    }

    public boolean isFull() {
        return getCurrentParticipantCount() >= maxParticipants;
    }

    public String getEventName() {
        return title != null ? title : "No Title";
    }

    public boolean isPublished() {
        return EventStatus.PUBLISHED.equals(this.status);
    }

    public boolean isCancelled() {
        return EventStatus.CANCELLED.equals(this.status);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Events events = (Events) o;
        return id != null && Objects.equals(id, events.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}