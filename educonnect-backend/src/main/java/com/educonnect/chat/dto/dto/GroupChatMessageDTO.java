package com.educonnect.chat.dto.dto;


import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GroupChatMessageDTO {

    private String content;

    private String fileUrl;

    private String fileName;

    private GroupChatMessage.MediaType mediaType;

    private Instant timestamp;

    private Users sender;

    private String groupName;

}
