package com.educonnect.qna.dto.request;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VoteQuestionRequest {

    private Long questionId;

    private UUID userId;

    private String type;

}
