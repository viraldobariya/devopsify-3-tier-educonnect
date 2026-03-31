package com.educonnect.exceptionhandling.exception;

public class FileSizeExceeded extends RuntimeException{

    public FileSizeExceeded(String message){
        super(message);
    }

}
