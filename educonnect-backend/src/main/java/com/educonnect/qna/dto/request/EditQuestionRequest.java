package com.educonnect.qna.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EditQuestionRequest {

    private Long id;

    private String title;

    private String description;

}
