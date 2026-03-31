package com.educonnect.qna.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VoteAnswerRequest {

    private Long answerId;

    private UUID userId;

    private String type;

}
