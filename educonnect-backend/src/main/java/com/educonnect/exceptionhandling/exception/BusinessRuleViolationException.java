package com.educonnect.exceptionhandling.exception;

public class BusinessRuleViolationException extends RuntimeException{
    public BusinessRuleViolationException(String message){
        super(message);
    }
}
