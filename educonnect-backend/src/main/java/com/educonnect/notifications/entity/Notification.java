package com.educonnect.notifications.entity;

import com.educonnect.user.entity.Users;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Users recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private Users actor;

//    @Enumerated(EnumType.STRING)
    private String type;

    @Column(length = 1000)
    private String message;

    // optional link you can open on click (event id, post url, etc)
    private String url;

    private boolean seen = false;

    private Date createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = new Date(); }


}
