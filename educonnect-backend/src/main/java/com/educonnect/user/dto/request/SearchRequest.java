package com.educonnect.user.dto.request;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SearchRequest {

    private String search;

    private Users.University university;

    private Users.Course course;

    private List<Users.Skill> skills;

    private int page;

    private int size;

}






