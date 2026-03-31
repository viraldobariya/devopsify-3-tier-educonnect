package com.educonnect.qna.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PostAnswerRequest {

    private Long questionId;

    private String description;

    private UUID authorId;

}
