package com.educonnect.exceptionhandling.handler;


import com.educonnect.exceptionhandling.dto.ExceptionDTO;
import com.educonnect.exceptionhandling.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class CentralizedHandler {

    @ExceptionHandler({InvalidCredentialsException.class, EmailSenderException.class, BusinessRuleViolationException.class, FileSizeExceeded.class, FileIsNotImageException.class, IllegalArgumentException.class})
    public ResponseEntity<ExceptionDTO> handleBadReuqests(Exception ex, HttpServletRequest request){
        ExceptionDTO response = new ExceptionDTO(
                ex.getClass().getName(),
                ex.getMessage(),
                request.getRequestURI(),
                400,
                LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler({FileUploadException.class, JwtCreateException.class})
    public ResponseEntity<ExceptionDTO> handleServerError(Exception ex, HttpServletRequest request){
        ExceptionDTO response = new ExceptionDTO(
                ex.getClass().getName(),
                ex.getMessage(),
                request.getRequestURI(),
                500,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler({JwtTokenExpired.class,})
    public ResponseEntity<ExceptionDTO> handleUnauthorization(Exception ex, HttpServletRequest request){
        ExceptionDTO response = new ExceptionDTO(
                ex.getClass().getName(),
                ex.getMessage(),
                request.getRequestURI(),
                401,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler({AccessDeniedException.class})
    public ResponseEntity<ExceptionDTO> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request){
        ExceptionDTO response = new ExceptionDTO(
                ex.getClass().getName(),
                ex.getMessage(),
                request.getRequestURI(),
                403,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
}
