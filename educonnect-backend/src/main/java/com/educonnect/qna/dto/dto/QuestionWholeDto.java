package com.educonnect.qna.dto.dto;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuestionWholeDto {

    private Long id;

    private String userVote;

    private Long voteCount;

    private String title;

    private String description;

    private Instant createdAt;

    private Instant updatedAt;

    private Users author;

    private Set<TagDto> tags;

    private List<AnswerDto> answers;

}
