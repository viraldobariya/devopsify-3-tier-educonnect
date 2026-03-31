package com.educonnect.auth.controller;


import com.educonnect.auth.dto.request.SendOtpRequest;
import com.educonnect.auth.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/mail")
public class EmailController {

    EmailService emailService;

    public EmailController(EmailService emailService){
        this.emailService = emailService;
    }

    @PostMapping("/otp")
    public ResponseEntity sendOtp(@RequestBody SendOtpRequest request){
        emailService.sendOtp(request);
        return ResponseEntity.status(HttpStatus.OK).body("Email successfully sended.");
    }

}
