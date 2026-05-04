package com.educonnect.chat.dto.request;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GroupChatRequest {

    private String name;

    private Boolean isPrivate;

    private List<Users> notifies = new ArrayList<>();

}
