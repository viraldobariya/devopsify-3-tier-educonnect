package com.educonnect.qna.entity;


import com.educonnect.user.entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
@EqualsAndHashCode(exclude = {"questions", "author", "votes"})
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Users author;

    @OneToMany(mappedBy = "answer", fetch = FetchType.LAZY)
    private Set<Vote> votes = new HashSet<>();

    private Instant createdAt;

    @PrePersist
    void beforeSaving(){
        this.createdAt = new Date().toInstant();
    }

}
