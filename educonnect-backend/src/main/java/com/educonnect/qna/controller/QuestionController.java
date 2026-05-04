package com.educonnect.qna.controller;


import com.educonnect.auth.service.AuthService;
import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.qna.dto.dto.MyQuestionDto;
import com.educonnect.qna.dto.dto.QuestionSearchDto;
import com.educonnect.qna.dto.dto.QuestionWholeDto;
import com.educonnect.qna.dto.dto.TagDto;
import com.educonnect.qna.dto.request.EditQuestionRequest;
import com.educonnect.qna.dto.request.SaveQuestionRequest;
import com.educonnect.qna.dto.request.SearchQuestionRequest;
import com.educonnect.qna.dto.request.VoteQuestionRequest;
import com.educonnect.qna.entity.Question;
import com.educonnect.qna.entity.Vote;
import com.educonnect.qna.repository.QuestionRepository;
import com.educonnect.qna.repository.VoteRepository;
import com.educonnect.qna.service.QuestionService;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question")
public class QuestionController {

    private final QuestionService questionService;

    private final AuthService authService;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public QuestionController(
            QuestionService questionService,
            AuthService authService,
            QuestionRepository questionRepository,
            UserRepository userRepository,
            VoteRepository voteRepository){
        this.questionService = questionService;
        this.authService = authService;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
    }

    @PostMapping("/save-question")
    public ResponseEntity<?> saveQuestion(@RequestBody SaveQuestionRequest request){
        questionService.saveQuestion(request);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/my-questions")
    public ResponseEntity<List<MyQuestionDto>> myQuestions(HttpServletRequest request, HttpServletResponse response){
        Users currentUser = authService.me(request, response);
        List<MyQuestionDto> myQuestionDtos = questionService.myQuestions(currentUser);

        return ResponseEntity.ok(myQuestionDtos);
    }

    @GetMapping("/top-tags")
    public ResponseEntity<List<TagDto>> topTags(@RequestParam(value = "top", defaultValue = "5") Integer top){
        List<TagDto> tags = questionService.topTags(top);
        return ResponseEntity.ok(tags);
    }

    @PutMapping("/edit-question")
    public ResponseEntity<?> editQuestion(@RequestBody EditQuestionRequest request){
        questionService.editQuestion(request);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/search-question")
    public ResponseEntity<Page<QuestionSearchDto>> searchQuestion(@RequestBody SearchQuestionRequest request){
        Page<QuestionSearchDto> response = questionService.searchQuestion(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-by-id")
    public ResponseEntity<QuestionWholeDto> getById(HttpServletRequest request, HttpServletResponse response, @RequestParam("id") Long id){
        Users currentUser = authService.me(request, response);
        QuestionWholeDto questionWholeDto = questionService.getById(id, currentUser);
        return ResponseEntity.ok(questionWholeDto);
    }

    @PostMapping("/vote-question")
    public ResponseEntity<?> voteQuestion(@RequestBody VoteQuestionRequest request){
        questionService.voteQuestion(request);
        return ResponseEntity.ok(null);
    }

}


