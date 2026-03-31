package com.educonnect.chat.dto.request;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.userdetails.User;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class HandleInviteRequest {

    private String groupName;

    private Users sender;

    private Boolean accept;

}
