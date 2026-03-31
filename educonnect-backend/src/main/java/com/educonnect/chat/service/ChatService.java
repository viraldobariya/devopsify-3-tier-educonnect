package com.educonnect.chat.service;


import com.educonnect.auth.service.EmailService;
import com.educonnect.chat.dto.dto.GroupChatDTO;
import com.educonnect.chat.dto.dto.GroupChatMessageDTO;
import com.educonnect.chat.dto.dto.GroupRequestJoinDTO;
import com.educonnect.chat.dto.request.*;
import com.educonnect.chat.entity.GroupChat;
import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.chat.entity.GroupRequestJoin;
import com.educonnect.chat.entity.PrivateChatMessage;
import com.educonnect.chat.mapper.GroupChatMapper;
import com.educonnect.chat.mapper.GroupChatMessageMapper;
import com.educonnect.chat.mapper.GroupRequestJoinMapper;
import com.educonnect.chat.repository.GroupChatMessageRepository;
import com.educonnect.chat.repository.GroupChatRepository;
import com.educonnect.chat.repository.GroupRequestJoinRepository;
import com.educonnect.chat.repository.PrivateChatMessageRepository;
import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.exceptionhandling.exception.InvalidCredentialsException;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.sql.ClientInfoStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final PrivateChatMessageRepository privateChatMessageRepository;

    private final GroupChatMessageRepository groupChatMessageRepository;

    private final GroupChatRepository groupChatRepository;

    private final UserRepository userRepository;

    private final GroupRequestJoinRepository groupRequestJoinRepository;

    private final EmailService emailService;

    private final GroupChatMapper groupChatMapper;

    private final GroupChatMessageMapper groupChatMessageMapper;

    private final GroupRequestJoinMapper groupRequestJoinMapper;

    private final ApplicationEventPublisher eventPublisher;

    public ChatService(
            UserRepository userRepository,
            PrivateChatMessageRepository privateChatMessageRepository,
            GroupChatMessageRepository groupChatMessageRepository,
            GroupChatRepository groupChatRepository,
            GroupRequestJoinRepository groupRequestJoinRepository,
            EmailService emailService,
            GroupChatMessageMapper groupChatMessageMapper,
            GroupChatMapper groupChatMapper,
            GroupRequestJoinMapper groupRequestJoinMapper,
            ApplicationEventPublisher eventPublisher
    ){
        this.privateChatMessageRepository = privateChatMessageRepository;
        this.groupChatRepository = groupChatRepository;
        this.groupChatMessageRepository = groupChatMessageRepository;
        this.userRepository = userRepository;
        this.groupRequestJoinRepository = groupRequestJoinRepository;
        this.emailService = emailService;
        this.groupChatMessageMapper = groupChatMessageMapper;
        this.groupChatMapper = groupChatMapper;
        this.groupRequestJoinMapper = groupRequestJoinMapper;
        this.eventPublisher = eventPublisher;
    }

    public PrivateChatMessage privateChat(PrivateChatRequest request){
        if (request.getMediaType() == null || request.getContent() == null || request.getFileUrl() == null || request.getFileName() == null || request.getSenderUname() == null || request.getReceiverUname() == null || request.getTimestamp() == null){
            throw new BusinessRuleViolationException("Null attributes given.");
        }

        Users sender = userRepository.findByUsername(request.getSenderUname());
        Users receiver = userRepository.findByUsername(request.getReceiverUname());

        if (sender == null || receiver == null){
            throw new BusinessRuleViolationException("sender or receiver uname doesn't found.");
        }

        PrivateChatMessage message = PrivateChatMessage.builder()
                .content(request.getContent())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .type(request.getMediaType())
                .receiver(receiver)
                .timestamp(request.getTimestamp())
                .sender(sender)
                .build();

        privateChatMessageRepository.save(message);

        return message;

    }

    public List<PrivateChatMessage> getMessages(Users sender, String receiverUname){
        Users receiver = userRepository.findByUsername(receiverUname);
        if (sender == null || receiver == null){
            throw new BusinessRuleViolationException("sender or receiver doesn't found.");
        }
        return privateChatMessageRepository.chatWith(sender, receiver);
    }

    public GroupChatDTO makeGroup(GroupChatRequest request, Users admin){
        if (request.getName() == null || request.getName().isEmpty() || admin == null){
            throw new BusinessRuleViolationException("null attributes given.");
        }

        System.out.println(request.getIsPrivate());

        GroupChat groupChat = GroupChat.builder()
                .admin(admin)
                .isPrivate(request.getIsPrivate())
                .name(request.getName())
                .build();

        GroupChat groupChat1 = groupChatRepository.save(groupChat);

        for(Users user : request.getNotifies()){
            emailService.sendGroupJoinRequest(admin.getFullName(), request.getName(), user.getEmail());
            GroupRequestJoin groupRequestJoin = new GroupRequestJoin();
            groupRequestJoin.setGroup(groupChat1);
            groupRequestJoin.setInvited(true);
            groupRequestJoin.setSender(user);
            groupRequestJoinRepository.save(groupRequestJoin);

            // Publish group invitation event for notifications
            eventPublisher.publishEvent(new GroupInvitationCreatedDomainEvent(
                request.getName(),
                user.getId(),
                admin.getId(),
                admin.getFullName()
            ));
        }

        GroupChatDTO groupChatDTO = groupChatMapper.toDto(groupChat1);

        return groupChatDTO;


    }

    public GroupChatDTO getGroup(String name){
        if (name == null){
            throw new BusinessRuleViolationException("null attributes given.");
        }

        GroupChat groupChat = groupChatRepository.findByName(name).orElseThrow(() ->
            new InvalidCredentialsException("invalid name for group.")
        );

        System.out.println("before" + groupChat.getIsPrivate());

        GroupChatDTO groupChatDTO = groupChatMapper.toDto(groupChat);

        System.out.println("after" + groupChatDTO.getIsPrivate());

        return groupChatDTO;
    }

    public List<GroupChatMessageDTO> getGroupMessages(String name){
        GroupChat groupChat = groupChatRepository.findByName(name).orElseThrow(() -> {
            throw new BusinessRuleViolationException("group name is wrong.");
        });

        List<GroupChatMessage> messages = groupChatMessageRepository.getMessages(groupChat);

        List<GroupChatMessageDTO> messageDTOS = groupChatMessageMapper.toDtoList(messages);

        return messageDTOS;
    }

    public List<GroupChatDTO> myGroups(Users user){
        List<GroupChat> groups = groupChatRepository.myGroups(user);

        List<GroupChatDTO> groupChatDTOS = groupChatMapper.toDtoList(groups);

        return groupChatDTOS;
    }

    public void joinRequest(GroupJoinRequest request, boolean invite){
        Users sender = userRepository.findByUsername(request.getUsername());
        Optional<GroupChat> groupChat = groupChatRepository.findByName(request.getGroupName());

        if (sender == null || groupChat.isEmpty()){
            throw new BusinessRuleViolationException("wrong attributes given.");
        }

        GroupRequestJoin groupRequestJoin = groupRequestJoinRepository.findBySenderAndGroup(sender, groupChat.get());

        if (groupRequestJoin != null){
            if (groupRequestJoin.getInvited() != invite){
                joinMember(new GroupJoinRequest(groupChat.get().getName(), sender.getUsername()));
            }
        }
        else{
            GroupRequestJoin requestJoin = new GroupRequestJoin();
            requestJoin.setGroup(groupChat.get());
            requestJoin.setSender(sender);
            requestJoin.setInvited(invite);

            groupRequestJoinRepository.save(requestJoin);
        }

    }

    public void joinMember(GroupJoinRequest request){
        Users sender = userRepository.findByUsername(request.getUsername());
        Optional<GroupChat> groupChat = groupChatRepository.findByName(request.getGroupName());

        if (sender == null || groupChat.isEmpty()){
            throw new BusinessRuleViolationException("wrong attributes given.");
        }

        groupChat.get().getMembers().add(sender);

        groupChatRepository.save(groupChat.get());
    }

    public List<GroupChatDTO> searchGroup(String search){
        List<GroupChat> groups = groupChatRepository.search(search);

        List<GroupChatDTO> groupChatDTOS = groupChatMapper.toDtoList(groups);

        return groupChatDTOS;
    }

    public boolean isValidGroup(String name){
        Optional<GroupChat> groupChat = groupChatRepository.findByName(name);
        return groupChat.isPresent();
    }

    public GroupChatMessageDTO storeGroupMessage(GroupChatMessageRequest request){
        if (request.getName() == null || request.getMediaType() == null || request.getSender() == null || request.getContent() == null || request.getFileName() == null || request.getFileUrl() == null || request.getTimestamp() == null){
            throw new BusinessRuleViolationException("null attributes given.");
        }

        GroupChat groupChat = groupChatRepository.findByName(request.getName()).orElseThrow(() -> {
            throw new BusinessRuleViolationException("invalid group name.");
        });

        GroupChatMessage message = GroupChatMessage.builder()
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .sender(request.getSender())
                .content(request.getContent())
                .groupChat(groupChat)
                .mediaType(request.getMediaType())
                .timestamp(request.getTimestamp())
                .build();

        GroupChatMessage message1 = groupChatMessageRepository.save(message);

        GroupChatMessageDTO messageDTO = groupChatMessageMapper.toDto(message1);

        return messageDTO;
    }

    public void bulkGroupInvites(BulkGroupInvites request){
        if (request.getGroupName() == null || request.getUsernames() == null){
            throw new BusinessRuleViolationException("Null attributes given.");
        }

        GroupChat groupChat = groupChatRepository.findByName(request.getGroupName()).orElseThrow(() ->
            new BusinessRuleViolationException("wrong group name given.")
        );

        for(String username: request.getUsernames()){
            Users receiver = userRepository.findByUsername(username);
            if (receiver == null) throw new BusinessRuleViolationException("Wrong username.");
            GroupRequestJoin tempMessage = groupRequestJoinRepository.findBySenderAndGroup(receiver, groupChat);
            if (tempMessage != null){
                if (!tempMessage.getInvited()){
                    joinMember(new GroupJoinRequest(groupChat.getName(), receiver.getUsername()));
                    groupRequestJoinRepository.delete(tempMessage);
                }
            }
            else{
                GroupRequestJoin groupRequestJoin = GroupRequestJoin.builder()
                        .group(groupChat)
                        .invited(true)
                        .sender(receiver)
                        .build();
                groupRequestJoinRepository.save(groupRequestJoin);

                // Publish group invitation event for notifications
                eventPublisher.publishEvent(new GroupInvitationCreatedDomainEvent(
                    groupChat.getName(),
                    receiver.getId(),
                    groupChat.getAdmin().getId(),
                    groupChat.getAdmin().getFullName()
                ));
            }
        }
    }

    public void leaveGroup(GroupJoinRequest request){
        Optional<GroupChat> groupChat = groupChatRepository.findByName(request.getGroupName());
        Users user = userRepository.findByUsername(request.getUsername());

        if (groupChat.isEmpty() || user == null){
            throw new BusinessRuleViolationException("Wrong attributes given.");
        }

        groupChat.get().setMembers(groupChat.get().getMembers().stream().filter(member -> member != user).collect(Collectors.toSet()));

        groupChatRepository.save(groupChat.get());
    }

    public List<GroupRequestJoinDTO> getInvites(Users user){
        List<GroupRequestJoin> groupRequestJoins = groupRequestJoinRepository.findBySenderAndInvited(user, true);

        List<GroupRequestJoinDTO> groupRequestJoinDTOS = groupRequestJoinMapper.toDtoList(groupRequestJoins);

        return groupRequestJoinDTOS;
    }

    public void handleInvite(HandleInviteRequest request){
        Optional<GroupChat> groupChat = groupChatRepository.findByName(request.getGroupName());

        if (request.getSender() == null || groupChat.isEmpty()){
            throw new BusinessRuleViolationException("wrong attributes given.");
        }

        GroupRequestJoin groupRequestJoin = groupRequestJoinRepository.findBySenderAndGroup(request.getSender(), groupChat.get());

        if (groupRequestJoin == null){
            throw new BusinessRuleViolationException("wrong attributes given.");
        }

        if (request.getAccept()){
            joinMember(new GroupJoinRequest(groupChat.get().getName(), request.getSender().getUsername()));
        }

        groupRequestJoinRepository.delete(groupRequestJoin);
    }

    public List<Users> getIncomingRequests(String groupName){
        GroupChat groupChat = groupChatRepository.findByName(groupName).orElseThrow(() -> new BusinessRuleViolationException("invalid group name."));

        List<GroupRequestJoin> groupRequestJoinDTOS = groupRequestJoinRepository.findByGroupAndInvited(groupChat, false);

        List<Users> users = new ArrayList<>();

        for(GroupRequestJoin requestJoin : groupRequestJoinDTOS){
            users.add(requestJoin.getSender());
        }

        return users;
    }

}
