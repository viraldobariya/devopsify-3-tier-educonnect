package com.educonnect.qna.dto.request;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SaveQuestionRequest {

    private String title;

    private String description;

    private String tags;

    private String authorUsername;

}
