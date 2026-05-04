package com.educonnect.qna.dto.dto;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuestionSearchDto {

    private Long id;

    private String title;

    private String description;

    private Boolean isAccepted;

    private List<TagDto> tags;

    private Long noOfAnswers;

    private Long votes;

    private Instant createdAt;

    private Instant updatedAt;

    private Users author;

}
