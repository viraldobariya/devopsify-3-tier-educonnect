package com.educonnect.qna.controller;


import com.educonnect.qna.dto.dto.AnswerDto;
import com.educonnect.qna.dto.request.PostAnswerRequest;
import com.educonnect.qna.dto.request.VoteAnswerRequest;
import com.educonnect.qna.service.AnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/answer")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(
            AnswerService answerService
    ){
        this.answerService = answerService;
    }

    @PostMapping("/vote-answer")
    public ResponseEntity<?> voteAnswer(@RequestBody VoteAnswerRequest request){
        answerService.voteAnswer(request);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/post-answer")
    public ResponseEntity<AnswerDto> postAnswer(@RequestBody PostAnswerRequest request){
        AnswerDto answerDto = answerService.postAnswer(request);
        return ResponseEntity.ok(answerDto);
    }

}
