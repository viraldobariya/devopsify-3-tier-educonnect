package com.educonnect.chat.controller;


import com.educonnect.auth.service.AuthService;
import com.educonnect.chat.dto.dto.GroupChatDTO;
import com.educonnect.chat.dto.dto.GroupChatMessageDTO;
import com.educonnect.chat.dto.dto.GroupRequestJoinDTO;
import com.educonnect.chat.dto.request.*;
import com.educonnect.chat.entity.GroupChat;
import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.chat.entity.GroupRequestJoin;
import com.educonnect.chat.entity.PrivateChatMessage;
import com.educonnect.chat.service.ChatService;
import com.educonnect.exceptionhandling.exception.FileUploadException;
import com.educonnect.user.entity.Users;
import com.educonnect.utils.aws.s3.S3FileUploadUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    private final S3FileUploadUtil s3FileUploadUtil;

    private final ChatService chatService;

    private final AuthService authService;

    private final SimpUserRegistry simpUserRegistry;

    public ChatRestController(S3FileUploadUtil s3FileUploadUtil, ChatService chatService, AuthService authService, SimpUserRegistry simpUserRegistry){
        this.s3FileUploadUtil = s3FileUploadUtil;
        this.chatService = chatService;
        this.authService = authService;
        this.simpUserRegistry = simpUserRegistry;
    }

    @PostMapping("/fileupload")
    public ResponseEntity<String> fileUpload(@RequestParam("file") MultipartFile file){
        String url;
        try{
            url = s3FileUploadUtil.uploadFile(file);
        }
        catch (Exception e){
            throw new FileUploadException("Exception while uploading file." + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.OK).body(url);
    }

    @PostMapping("/private")
    public ResponseEntity<PrivateChatMessage> privateChat(@RequestBody PrivateChatRequest request){
        System.out.println(request);
        PrivateChatMessage message = chatService.privateChat(request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/get-private")
    public ResponseEntity<?> getPrivateChat(HttpServletRequest request, HttpServletResponse response, @RequestParam(value = "with") String receiverUname){
        Users currentUser = authService.me(request, response);
        List<PrivateChatMessage> messages = chatService.getMessages(currentUser, receiverUname);
        return ResponseEntity.status(HttpStatus.OK).body(messages);
    }

    @GetMapping("/get-online")
    public ResponseEntity<Integer> getCount(){
        return ResponseEntity.ok(simpUserRegistry.getUserCount());
    }

    @PostMapping("/make-group")
    public ResponseEntity<GroupChatDTO> makeGroup(HttpServletRequest request, HttpServletResponse response, @RequestBody GroupChatRequest requestData){
        Users admin = authService.me(request, response);
        GroupChatDTO groupChat = chatService.makeGroup(requestData, admin);
        return ResponseEntity.ok(groupChat);
    }

    @GetMapping("/get-group/{groupName}")
    public ResponseEntity<GroupChatDTO> getGroup(@PathVariable("groupName") String name){
        GroupChatDTO groupChat = chatService.getGroup(name);
        return ResponseEntity.ok(groupChat);
    }

    @GetMapping("/get-group-messages/{groupName}")
    public ResponseEntity<List<GroupChatMessageDTO>> getGroupMessages(@PathVariable("groupName") String name){
        List<GroupChatMessageDTO> messages = chatService.getGroupMessages(name);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupChatDTO>> myGroups(HttpServletRequest request, HttpServletResponse response){
        Users currentUser = authService.me(request, response);
        List<GroupChatDTO> groups = chatService.myGroups(currentUser);
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/group-join")
    public ResponseEntity<?> joinMember(@RequestBody GroupJoinRequest request){
        chatService.joinMember(request);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/group-request")
    public ResponseEntity<?> joinRequest(@RequestBody GroupJoinRequest request){
        chatService.joinRequest(request, false);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/group-search")
    public ResponseEntity<List<GroupChatDTO>> searchGroup(@RequestParam("search") String search){
        List<GroupChatDTO> groups = chatService.searchGroup(search);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/valid-group")
    public ResponseEntity<Boolean> isValidGroup(@RequestParam("name") String name){
        boolean isValid = chatService.isValidGroup(name);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/store-group-message")
    public ResponseEntity<GroupChatMessageDTO> storeGroupMessage(@RequestBody GroupChatMessageRequest request){
        GroupChatMessageDTO message = chatService.storeGroupMessage(request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/group-invites")
    public ResponseEntity<?> inviteGroup(@RequestBody GroupJoinRequest request){
        chatService.joinRequest(request, true);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/bulk-group-invites")
    public ResponseEntity<?> bulkGroupInvites(@RequestBody BulkGroupInvites request){
        chatService.bulkGroupInvites(request);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/leave-group")
    public ResponseEntity<?> leaveGroup(@RequestBody GroupJoinRequest request){
        chatService.leaveGroup(request);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/get-invites")
    public ResponseEntity<List<GroupRequestJoinDTO>> getInvites(@RequestBody Users user){
        List<GroupRequestJoinDTO> response = chatService.getInvites(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/handle-invite")
    public ResponseEntity<?> handleInvite(@RequestBody HandleInviteRequest request){
        chatService.handleInvite(request);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/get-incoming-requests")
    public ResponseEntity<List<Users>> getIncomingRequests(@RequestParam("group-name") String groupName){
        List<Users> users = chatService.getIncomingRequests(groupName);
        return ResponseEntity.ok(users);
    }
}