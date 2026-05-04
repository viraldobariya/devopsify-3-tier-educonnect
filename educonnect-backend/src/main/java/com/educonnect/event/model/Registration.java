package com.educonnect.event.model;

import com.educonnect.event.enums.RegistrationStatus;
import com.educonnect.event.enums.TicketStatus;
import com.educonnect.user.entity.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "registrations" ,
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"event_id" , "user_id"})
        })
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id" , nullable = false)
    private Events event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id" , nullable = false)
    private Users user;

    @Column(nullable = false)
    private LocalDateTime registrationDate;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "form_response_id", unique = true)
    private FormResponse formResponse;

    @OneToOne(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_form_id")
    private RegistrationForm registrationForm;

    @Column(nullable = false)
    private Boolean requiresFormSubmission = true;

    @Column(nullable = false)
    private Boolean formSubmitted = false;


    private LocalDateTime statusUpdatedAt;


    public Registration(Events event, Users user) {
        this.event = event;
        this.user = user;
        this.registrationDate = LocalDateTime.now();
    }

    public Registration(Events event, Users user, RegistrationForm registrationForm) {
        this.event = event;
        this.user = user;
        this.registrationForm = registrationForm;
        this.registrationDate = LocalDateTime.now();
        this.requiresFormSubmission = (registrationForm != null);
    }

    @PrePersist
    protected void onCreate() {
        if (this.registrationDate == null) {
            this.registrationDate = LocalDateTime.now();
        }
        this.statusUpdatedAt = LocalDateTime.now();
    }

    @PostPersist
    protected void afterCreate() {
        if (this.ticket == null) {
            Ticket ticket = new Ticket(this.event, this.user, this);
            this.setTicket(ticket);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.statusUpdatedAt = LocalDateTime.now();

        // Update ticket status if ticket exists
        if (this.ticket != null) {
            this.ticket.updateStatusBasedOnRegistration();
        }
    }

    public boolean canBeConfirmed() {
        return !requiresFormSubmission || formSubmitted;
    }

    public void markFormAsSubmitted(FormResponse formResponse) {
        this.formResponse = formResponse;
        this.formSubmitted = true;
        // Trigger ticket update when form is submitted
        if (this.ticket != null) {
            this.ticket.updateStatusBasedOnRegistration();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Registration that = (Registration) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}