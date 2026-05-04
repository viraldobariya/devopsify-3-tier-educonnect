package com.educonnect.chat.dto.dto;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GroupChatDTO {

    private String name;

    private Users admin;

    private Set<Users> members;

    private Boolean isPrivate;

}
