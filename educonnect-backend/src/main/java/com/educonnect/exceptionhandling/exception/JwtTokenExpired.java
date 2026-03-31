package com.educonnect.exceptionhandling.exception;

import io.jsonwebtoken.Jwt;

public class JwtTokenExpired extends RuntimeException{

    public JwtTokenExpired(String message){
        super(message);
    }

}
