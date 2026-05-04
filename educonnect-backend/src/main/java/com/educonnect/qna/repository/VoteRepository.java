package com.educonnect.qna.repository;

import com.educonnect.qna.entity.Answer;
import com.educonnect.qna.entity.Question;
import com.educonnect.qna.entity.Vote;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserAndAnswer(Users user, Answer answer);

    Optional<Vote> findByUserAndQuestion(Users user, Question question);

}
