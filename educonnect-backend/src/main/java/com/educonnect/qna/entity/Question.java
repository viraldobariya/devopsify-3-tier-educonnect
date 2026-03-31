package com.educonnect.qna.entity;


import com.educonnect.user.entity.Users;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;

import java.time.Instant;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@EqualsAndHashCode(exclude = {"tags", "answers", "acceptedAnswer", "author"})
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "question_tag",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    private Set<Answer> answers = new HashSet<>();

    private Instant createdAt;

    private Instant updatedAt;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    private Set<Vote> votes = new HashSet<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_id")
    private Answer acceptedAnswer;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Users author;

    @PrePersist
    public void prePersist(){
        this.createdAt = new Date().toInstant();
        this.updatedAt = new Date().toInstant();
    }

    @PreUpdate
    public void preUpdate(){
        this.updatedAt = new Date().toInstant();
    }

}


