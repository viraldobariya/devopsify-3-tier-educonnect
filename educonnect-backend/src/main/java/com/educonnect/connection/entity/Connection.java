package com.educonnect.connection.entity;


import com.educonnect.user.entity.Users;
import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.*;

import java.util.Date;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "user_connection", uniqueConstraints = {@UniqueConstraint(columnNames = {"sender_id", "receiver_id"})})
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Users sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private Users receiver;

    private Date createdAt;

    private Date updatedAt;

    @NonNull
    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @PrePersist
    public void prePersist(){
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    public void preUpdate(){
        updatedAt = new Date();
    }

    public enum RequestStatus{
        PENDING,
        ACCEPTED,
    }

}
