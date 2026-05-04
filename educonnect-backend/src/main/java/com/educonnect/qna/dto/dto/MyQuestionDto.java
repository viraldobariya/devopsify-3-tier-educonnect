package com.educonnect.qna.dto.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MyQuestionDto {

    private Long id;

    private String title;

    private String description;

    private Set<TagDto> tags;

}
