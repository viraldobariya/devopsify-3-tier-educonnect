package com.educonnect.chat.controller;


import com.educonnect.chat.dto.dto.GroupChatMessageDTO;
import com.educonnect.chat.dto.request.GroupChatMessageRequest;
import com.educonnect.chat.dto.request.PrivateChatRequest;
import com.educonnect.chat.dto.response.PrivateSocketResponse;
import com.educonnect.chat.mapper.GroupChatMessageMapper;
import com.educonnect.chat.service.ChatService;
import com.educonnect.chat.service.GroupMessageCreatedDomainEvent;
import com.educonnect.notifications.service.NotificationService;
import com.educonnect.user.dto.response.FindResponse;
import com.educonnect.user.service.UserService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    private final UserService userService;

    private  final NotificationService notificationService;

    private final GroupChatMessageMapper groupChatMessageMapper;

    private final ChatService   chatService;

    private final ApplicationEventPublisher eventPublisher;

    public ChatController(
            SimpMessagingTemplate messagingTemplate,
            UserService userService,
            GroupChatMessageMapper groupChatMessageMapper,
            NotificationService notificationService,
            ChatService chatService,
            ApplicationEventPublisher eventPublisher
    ){
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
        this.groupChatMessageMapper = groupChatMessageMapper;
        this.notificationService = notificationService;
        this.chatService = chatService;
        this.eventPublisher = eventPublisher;
    }

    @MessageMapping("/private-chat")
    public void sendPrivateMessage(@Payload PrivateChatRequest request, Principal principal){
        FindResponse sender = userService.find(request.getSenderUname());
        FindResponse receiver = userService.find(request.getReceiverUname());

        messagingTemplate.convertAndSendToUser(
                request.getReceiverUname(),
                "/queue/message",
                PrivateSocketResponse.builder()
                        .content(request.getContent())
                        .fileUrl(request.getFileUrl())
                        .timestamp(request.getTimestamp())
                        .mediaType(request.getMediaType())
                        .receiver(receiver.getUser())
                        .fileName(request.getFileName())
                        .sender(sender.getUser())
                        .build()
        );
        notificationService.createNotification(receiver.getUser(), sender.getUser(), "NEW_MESSAGE",
                "New message from: " + sender.getUser().getFullName() , "/chat");
    }

    @MessageMapping("/group-chat")
    public void sendGroupMessage(@Payload GroupChatMessageRequest request, Principal principal){
        System.out.println(request);

        // Store the message in database
        GroupChatMessageDTO savedMessage = chatService.storeGroupMessage(request);

        // Send message to group topic
        messagingTemplate.convertAndSend("/topic/group/"+request.getName(),
                request
        );

        // Publish domain event for notifications
        eventPublisher.publishEvent(new GroupMessageCreatedDomainEvent(
                request.getName(),
                request.getSender().getId(),
                request.getSender().getFullName(),
                "NEW_GROUP_MESSAGE",
                "New message in group: " + request.getName()
        ));
    }
}