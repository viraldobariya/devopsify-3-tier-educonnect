package com.educonnect.qna.repository;

import com.educonnect.qna.entity.Answer;
import com.educonnect.qna.entity.Vote;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Query("""
            SELECT v
            FROM Answer a
            JOIN a.votes v
            WHERE v.user = :user
            AND a.id = :id
            """)
    Vote getVote(Long id, Users user);

}
