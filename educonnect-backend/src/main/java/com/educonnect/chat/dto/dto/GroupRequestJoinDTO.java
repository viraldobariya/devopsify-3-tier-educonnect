package com.educonnect.chat.dto.dto;


import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GroupRequestJoinDTO {

    private Users sender;

    private String groupName;

}