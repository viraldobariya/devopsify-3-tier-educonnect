package com.educonnect.exceptionhandling.exception;

public class FileIsNotImageException extends RuntimeException{

    public FileIsNotImageException(String message){
        super(message);
    }

}
