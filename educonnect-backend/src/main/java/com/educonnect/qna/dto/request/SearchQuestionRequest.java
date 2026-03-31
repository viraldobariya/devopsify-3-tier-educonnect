package com.educonnect.qna.dto.request;


import jakarta.annotation.sql.DataSourceDefinition;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SearchQuestionRequest {

    private String search;

    private Integer page;

    private Integer size;

}
