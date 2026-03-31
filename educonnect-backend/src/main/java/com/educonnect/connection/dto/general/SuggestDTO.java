package com.educonnect.connection.dto.general;

import com.educonnect.connection.entity.Connection;
import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.userdetails.User;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class SuggestDTO {

    private Users user;

    private String status;

}

