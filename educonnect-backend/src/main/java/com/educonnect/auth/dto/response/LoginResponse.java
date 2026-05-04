package com.educonnect.auth.dto.response;


import com.educonnect.user.entity.Users;
import jakarta.persistence.Access;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LoginResponse {

    private Users user;

    private String accessToken;

}
