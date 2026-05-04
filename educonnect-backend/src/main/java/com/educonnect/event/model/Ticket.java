package com.educonnect.event.model;

import com.educonnect.user.entity.Users;
import com.educonnect.event.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;
import java.time.LocalDateTime;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime issueDate;

    private LocalDateTime activationDate; // When ticket becomes active (form submitted)

    private LocalDateTime usedDate; // When ticket was used for entry

    private LocalDateTime expirationDate; // Auto-set to event end date

    @Column(nullable = false)
    private boolean canGeneratePdf = false;

    // Ticket holder information (for PDF)
    @Column(nullable = false)
    private String holderName;

    @Column(nullable = false)
    private String holderEmail;

    @Column(nullable = true)
    private Users.University holderUniversity;

    // Event information (denormalized for PDF generation)
    @Column(nullable = false)
    private String eventTitle;

    @Column(nullable = false)
    private String eventLocation;

    @Column(nullable = false)
    private LocalDateTime eventStartDate;

    @Column(nullable = false)
    private LocalDateTime eventEndDate;

    @Column(nullable = true, length = 1000)
    private String eventDescription;

    @Column(nullable = true)
    private String eventBannerUrl;


    // Additional PDF details
    @Column(nullable = true, length = 2000)
    private String specialInstructions; // Special instructions for the event

    @Column(nullable = true)
    private String organizerName;

    @Column(nullable = true)
    private String organizerContact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Events event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructor for creating ticket when user registers
    public Ticket(Events event, Users user, Registration registration) {
        this.event = event;
        this.user = user;
        this.registration = registration;
        this.issueDate = LocalDateTime.now();
        this.expirationDate = event.getEndDate();

        this.holderName = user.getFullName();
        this.holderEmail = user.getEmail();
        this.holderUniversity = user.getUniversity();

        this.eventTitle = event.getTitle();
        this.eventLocation = event.getLocation();
        this.eventStartDate = event.getStartDate();
        this.eventEndDate = event.getEndDate();
        this.eventDescription = event.getDescription();
        this.eventBannerUrl = event.getBannerUrl();

        this.organizerName = event.getCreatedBy().getFullName();
        this.organizerContact = event.getCreatedBy().getEmail();

        this.status = TicketStatus.ACTIVE;
        this.activationDate = LocalDateTime.now();
        this.canGeneratePdf = true;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();

    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Business logic methods
    public void activateTicket() {
        this.status = TicketStatus.ACTIVE;
        this.activationDate = LocalDateTime.now();
        this.canGeneratePdf = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivateTicket() {
        this.status = TicketStatus.PENDING;
        this.canGeneratePdf = false;
        this.activationDate = null;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatusBasedOnRegistration() {
        if (registration != null) {
            boolean shouldBeActive = registration.canBeConfirmed();

            if (shouldBeActive && this.status == TicketStatus.PENDING) {
                activateTicket();
            } else if (!shouldBeActive && this.status == TicketStatus.ACTIVE) {
                deactivateTicket();
            }
        }
    }

    public void markAsUsed() {
        if (this.status == TicketStatus.ACTIVE) {
            this.status = TicketStatus.USED;
            this.usedDate = LocalDateTime.now();
        }
    }

    public void cancelTicket() {
        this.status = TicketStatus.CANCELLED;
        this.canGeneratePdf = false;
    }

    public boolean isValid() {
        return this.status == TicketStatus.ACTIVE &&
               LocalDateTime.now().isBefore(this.expirationDate) &&
               registration.getFormSubmitted();
    }

    public boolean canAccessTicket() {
        return registration.getFormSubmitted() && this.canGeneratePdf;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expirationDate) ||
               LocalDateTime.now().isAfter(this.eventEndDate);
    }

    public String getFormattedEventDuration() {
        if (eventStartDate != null && eventEndDate != null) {
            return eventStartDate.toLocalDate().equals(eventEndDate.toLocalDate()) ?
                eventStartDate.toLocalDate() + " " + eventStartDate.toLocalTime() + " - " + eventEndDate.toLocalTime() :
                eventStartDate + " to " + eventEndDate;
        }
        return "TBD";
    }

    public String getTicketStatusDisplay() {
        return switch (this.status) {
            case PENDING -> "Pending Form Submission";
            case ACTIVE -> "Valid Ticket";
            case USED -> "Used";
            case CANCELLED -> "Cancelled";
            case EXPIRED -> "Expired";
        };
    }

    public void syncWithEvent() {
        if (this.event != null) {
            this.eventTitle = event.getTitle();
            this.eventLocation = event.getLocation();
            this.eventStartDate = event.getStartDate();
            this.eventEndDate = event.getEndDate();
            this.eventDescription = event.getDescription();
            this.eventBannerUrl = event.getBannerUrl();
            this.expirationDate = event.getEndDate();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Ticket ticket = (Ticket) o;
        return id != null && Objects.equals(id, ticket.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

