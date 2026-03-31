package com.educonnect.exceptionhandling.exception;

public class JwtCreateException extends RuntimeException{

    public JwtCreateException(String message){
        super(message);
    }

}