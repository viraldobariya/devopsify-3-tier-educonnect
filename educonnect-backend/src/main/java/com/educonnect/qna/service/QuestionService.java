package com.educonnect.qna.service;


import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.qna.dto.dto.*;
import com.educonnect.qna.dto.request.EditQuestionRequest;
import com.educonnect.qna.dto.request.SaveQuestionRequest;
import com.educonnect.qna.dto.request.SearchQuestionRequest;
import com.educonnect.qna.dto.request.VoteQuestionRequest;
import com.educonnect.qna.entity.Question;
import com.educonnect.qna.entity.Tag;
import com.educonnect.qna.entity.Vote;
import com.educonnect.qna.mapper.QuestionMapper;
import com.educonnect.qna.repository.AnswerRepository;
import com.educonnect.qna.repository.QuestionRepository;
import com.educonnect.qna.repository.TagRepository;
import com.educonnect.qna.repository.VoteRepository;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    private final TagRepository tagRepository;

    private final UserRepository userRepository;

    private final QuestionMapper questionMapper;
    private final AnswerRepository answerRepository;
    private final VoteRepository voteRepository;
    private final ApplicationEventPublisher eventPublisher;

    public QuestionService(
            QuestionRepository questionRepository,
            TagRepository tagRepository,
            UserRepository userRepository,
            QuestionMapper questionMapper,
            AnswerRepository answerRepository,
            VoteRepository voteRepository,
            ApplicationEventPublisher eventPublisher){
        this.questionRepository = questionRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.questionMapper = questionMapper;
        this.answerRepository = answerRepository;
        this.voteRepository = voteRepository;
        this.eventPublisher = eventPublisher;
    }


    public void saveQuestion(SaveQuestionRequest request){
        if (request.getTitle() == null || request.getDescription() == null || request.getTags() == null || request.getAuthorUsername() == null){
            throw new BusinessRuleViolationException("Null attributes given.");
        }

        Users author = userRepository.findByUsername(request.getAuthorUsername());

        if (author == null){
            throw new BusinessRuleViolationException("Wrong author username");
        }

        request.setTags(request.getTags().toLowerCase());

        Question question = new Question();
        question.setAuthor(author);
        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());

        Set<Tag> tags = new HashSet<>();

        if (!request.getTags().matches("^(?=.{1,25}$)(?:[a-zA-Z0-9]{1,10})(?: (?:[a-zA-Z0-9]{1,10})){0,4}$")){
            throw new BusinessRuleViolationException("Wrong tags");
        }

        String[] tagStrings = request.getTags().split(" ");

        for(String tag : tagStrings){
            Tag tempTag = tagRepository.findByNameIgnoreCase(tag).orElseGet(() ->
                    tagRepository.save(Tag.builder().name(tag).build())
            );
            tags.add(tempTag);
        }

        question.setTags(tags);

        Question savedQuestion = questionRepository.save(question);

        eventPublisher.publishEvent(new QuestionCreatedDomainEvent(
            savedQuestion.getId(),
            author.getId(),
            author.getFullName(),
            savedQuestion.getTitle()
        ));
    }

    public List<MyQuestionDto> myQuestions(Users user){
        if (user.getId() == null){
            throw new BusinessRuleViolationException("null attributes found.");
        }
        List<Question> questions = questionRepository.findByAuthor_IdOrderByCreatedAtDesc(user.getId());

        List<MyQuestionDto> myQuestionDtos = questionMapper.toMyDtoList(questions);

        return myQuestionDtos;
    }

    public List<TagDto> topTags(Integer top){
        List<TagDto> tags = tagRepository.topTags(top);
        return tags;
    }

    public void editQuestion(EditQuestionRequest request){
        if (request.getDescription() == null || request.getTitle() == null || request.getId() == null){
            throw new BusinessRuleViolationException("null attributes given.");
        }

        Question question = questionRepository.findById(request.getId()).orElseThrow(() -> new BusinessRuleViolationException("Invalid id given."));

        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());

        questionRepository.save(question);

        return;
    }

    private Specification<Question> buildSearchSpec(String input) {
        return (root, query, cb) -> {
            if (input == null || input.trim().isEmpty()) {
                return cb.conjunction(); // no filtering
            }

            String[] parts = input.trim().split("\\s+");
            List<Predicate> andPredicates = new ArrayList<>();

            for (String part : parts) {
                String keyword = "%" + part.trim().toLowerCase() + "%";

                Predicate titleLike = cb.like(cb.lower(root.get("title")), keyword);
                Predicate descLike = cb.like(cb.lower(root.get("description")), keyword);

                andPredicates.add(cb.or(titleLike, descLike));
            }

            return cb.and(andPredicates.toArray(new Predicate[0]));
        };
    }


    public Page<QuestionSearchDto> searchQuestion(SearchQuestionRequest request){
        if (request.getSearch() ==  null || request.getPage() == null || request.getSize() == null){
            throw new BusinessRuleViolationException("Null attributes given.");
        }
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Specification<Question> spec = buildSearchSpec(request.getSearch());
        Page<Question> questions = questionRepository.findAll(spec, pageable);
        Page<QuestionSearchDto> questionSearchDtos = new PageImpl<>(questionMapper.toSearchDtoList(questions.getContent()), pageable, questions.getTotalElements());

        return questionSearchDtos;

    }

    public QuestionWholeDto getById(Long id, Users user){

        Question question = questionRepository.findByIdWithAnswers(id).orElseThrow(() -> new BusinessRuleViolationException("invalid id."));
        QuestionWholeDto questionWholeDto = questionMapper.toWholeDto(question);
        Vote qvote = questionRepository.getVote(id, user);
        if (qvote == null){
            questionWholeDto.setUserVote("");
        }
        else if(qvote.getValue() == 1){
            questionWholeDto.setUserVote("UPVOTE");
        }
        else{
            questionWholeDto.setUserVote("DOWNVOTE");
        }
        for(AnswerDto answer: questionWholeDto.getAnswers()){
            Vote avote = answerRepository.getVote(answer.getId(), user);
            if (avote == null){
                answer.setUserVote("");
            }
            else if(avote.getValue() == 1){
                answer.setUserVote("UPVOTE");
            }
            else{
                answer.setUserVote("DOWNVOTE");
            }
        }

        return questionWholeDto;
    }

    public void voteQuestion(VoteQuestionRequest request){
        if (request.getType() == null || request.getQuestionId() == null || request.getUserId() == null){
            throw new BusinessRuleViolationException("null attributes given.");
        }

        Question question = questionRepository.findById(request.getQuestionId()).orElseThrow(() -> new BusinessRuleViolationException("Invalid question id."));
        Users user = userRepository.findById(request.getUserId()).orElseThrow(() -> new BusinessRuleViolationException("invalid user id."));

        Optional<Vote> votePresent = voteRepository.findByUserAndQuestion(user, question);

        if (votePresent.isPresent()){
            votePresent.get().setValue(request.getType().equals("UPVOTE") ? 1 : -1);
            voteRepository.save(votePresent.get());
            return;
        }

        Vote vote = Vote.builder()
                .question(question)
                .user(user)
                .value(request.getType().equals("UPVOTE") ? 1 : -1)
                .build();

        voteRepository.save(vote);
    }
}
