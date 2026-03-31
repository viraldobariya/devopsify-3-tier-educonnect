package com.educonnect.qna.repository;

import com.educonnect.qna.entity.Question;
import com.educonnect.qna.entity.Vote;
import com.educonnect.user.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("""
            SELECT DISTINCT q
            FROM Question q
            JOIN FETCH q.tags t
            WHERE q.author.id = :userId
            ORDER BY q.createdAt DESC
            """)
    List<Question> findByAuthor_IdOrderByCreatedAtDesc(UUID userId);

    Page<Question> findAll(Specification<Question> spec, Pageable pageable);

    @Query("""
            SELECT v
            FROM Question q
            JOIN q.votes v
            WHERE
            v.user = :user
            AND q.id = :id
            """)
    Vote getVote(Long id, Users user);

    @Query("""
            SELECT q
            FROM Question q
            LEFT JOIN FETCH q.answers
            WHERE q.id = :id
            """)
    Optional<Question> findByIdWithAnswers(Long id);

}
