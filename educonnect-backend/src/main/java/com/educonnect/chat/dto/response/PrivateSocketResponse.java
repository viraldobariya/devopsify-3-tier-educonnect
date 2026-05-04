package com.educonnect.chat.dto.response;


import com.educonnect.chat.entity.PrivateChatMessage;
import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrivateSocketResponse {

    private PrivateChatMessage.MediaType mediaType;

    private String content;

    private String fileName;

    private String fileUrl;

    private Users sender;

    private Users receiver;

    private Instant timestamp;

}
