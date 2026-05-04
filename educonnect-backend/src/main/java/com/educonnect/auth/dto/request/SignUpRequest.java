package com.educonnect.auth.dto.request;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class SignUpRequest {

    private String fullName;

    private String username;

    private String password;

    private Users.Role role;

    private String email;

    private Users.Course course;

    private Users.University university;

    private Set<Users.Skill> skills;

}
