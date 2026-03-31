package com.educonnect.chat.dto.request;


import com.educonnect.chat.entity.PrivateChatMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrivateChatRequest {

    private PrivateChatMessage.MediaType mediaType;

    private String content;

    private String fileName;

    private String fileUrl;

    private String senderUname;

    private String receiverUname;

    private Instant timestamp;

}
