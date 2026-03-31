package com.educonnect.exceptionhandling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class ExceptionDTO {

    private String name;

    private String message;

    private String path;

    private int status;

    private LocalDateTime time;

}
