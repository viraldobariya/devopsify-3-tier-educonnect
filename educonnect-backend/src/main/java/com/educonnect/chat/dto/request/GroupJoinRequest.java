package com.educonnect.chat.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GroupJoinRequest {

    private String groupName;

    private String username;

}
