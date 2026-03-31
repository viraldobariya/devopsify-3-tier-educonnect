package com.educonnect.qna.dto.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TagDto {

    private Long id;

    private String name;

    private Long count;

}
