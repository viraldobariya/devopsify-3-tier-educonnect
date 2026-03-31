package com.educonnect.exceptionhandling.exception;

import com.educonnect.auth.service.EmailService;

public class EmailSenderException extends RuntimeException {

    public EmailSenderException(String message){
        super(message);
    }
}
