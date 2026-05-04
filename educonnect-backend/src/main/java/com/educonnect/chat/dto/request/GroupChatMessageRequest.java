package com.educonnect.chat.dto.request;


import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GroupChatMessageRequest {

    private String name;

    private Users sender;

    private GroupChatMessage.MediaType mediaType;

    private String content;

    private String fileUrl;

    private String fileName;

    private Instant timestamp;

}
