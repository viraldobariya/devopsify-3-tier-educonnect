package com.educonnect.qna.dto.dto;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnswerDto {

    private Long id;

    private String userVote;

    private Long voteCount;

    private String description;

    private Users author;

    private Instant createdAt;

}
