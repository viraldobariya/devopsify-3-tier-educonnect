package com.educonnect.qna.service;


import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.qna.dto.dto.AnswerDto;
import com.educonnect.qna.dto.request.PostAnswerRequest;
import com.educonnect.qna.dto.request.VoteAnswerRequest;
import com.educonnect.qna.entity.Answer;
import com.educonnect.qna.entity.Question;
import com.educonnect.qna.entity.Vote;
import com.educonnect.qna.mapper.AnswerMapper;
import com.educonnect.qna.repository.AnswerRepository;
import com.educonnect.qna.repository.QuestionRepository;
import com.educonnect.qna.repository.VoteRepository;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final QuestionRepository questionRepository;
    private final AnswerMapper answerMapper;
    private final ApplicationEventPublisher eventPublisher;

    public AnswerService(
            AnswerRepository answerRepository,
            UserRepository userRepository,
            VoteRepository voteRepository,
            QuestionRepository questionRepository,
            AnswerMapper answerMapper,
            ApplicationEventPublisher eventPublisher
    ){
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
        this.questionRepository = questionRepository;
        this.answerMapper = answerMapper;
        this.eventPublisher = eventPublisher;
    }

    public void voteAnswer(VoteAnswerRequest request){
        if (request.getType() == null || request.getAnswerId() == null || request.getUserId() == null){
            throw new BusinessRuleViolationException("null attributes given.");
        }

        Answer answer = answerRepository.findById(request.getAnswerId()).orElseThrow(() -> new BusinessRuleViolationException("Invalid answer id."));
        Users user = userRepository.findById(request.getUserId()).orElseThrow(() -> new BusinessRuleViolationException("invalid user id."));

        Optional<Vote> votePresent = voteRepository.findByUserAndAnswer(user, answer);

        if (votePresent.isPresent()){
            votePresent.get().setValue(request.getType().equals("UPVOTE") ? 1 : -1);
            voteRepository.save(votePresent.get());
            return;
        }

        Vote vote = Vote.builder()
                .answer(answer)
                .user(user)
                .value(request.getType().equals("UPVOTE") ? 1 : -1)
                .build();

        voteRepository.save(vote);
    }

    public AnswerDto postAnswer(PostAnswerRequest request){
        Users author = userRepository.findById(request.getAuthorId()).orElseThrow(() -> new BusinessRuleViolationException("invalid userid"));
        Question question = questionRepository.findById(request.getQuestionId()).orElseThrow(() -> new BusinessRuleViolationException("invalid questionid"));

        Answer answer = Answer.builder()
                .question(question)
                .author(author)
                .description(request.getDescription())
                .build();

        Answer savedAnswer = answerRepository.save(answer);

        eventPublisher.publishEvent(new AnswerCreatedDomainEvent(
            savedAnswer.getId(),
            question.getId(),
            author.getId(),
            author.getFullName(),
            question.getAuthor().getId()
        ));

        AnswerDto answerDto = answerMapper.toDto(savedAnswer);

        return answerDto;
    }

}
