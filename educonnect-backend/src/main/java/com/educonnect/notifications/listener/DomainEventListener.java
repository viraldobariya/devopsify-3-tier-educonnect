package com.educonnect.notifications.listener;

import com.educonnect.chat.service.GroupMessageCreatedDomainEvent;
import com.educonnect.chat.service.GroupInvitationCreatedDomainEvent;
import com.educonnect.connection.service.ConnectionCreatedDomainEvent;
import com.educonnect.connection.service.ConnectionRequestCreatedDomainEvent;
import com.educonnect.event.service.EventCreatedDomainEvent;
import com.educonnect.qna.service.QuestionCreatedDomainEvent;
import com.educonnect.qna.service.AnswerCreatedDomainEvent;
import com.educonnect.notifications.service.NotificationService;
import com.educonnect.user.service.UserService;
import com.educonnect.user.entity.Users;
import com.educonnect.chat.entity.GroupChat;
import com.educonnect.chat.repository.GroupChatRepository;
import com.educonnect.connection.service.ConnectionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DomainEventListener {

    private final NotificationService notificationService;
    private final ConnectionService conection;
    private final UserService userService;
    private final GroupChatRepository groupChatRepository;

    @Async
    @EventListener
    public void onEventCreated(EventCreatedDomainEvent ev) {

        Users user = userService.findById(ev.creatorId());

        List<Users> recipients = conection.getConnections(user);

        for (Users r : recipients) {
            notificationService.createNotification(r, userService.findById(ev.creatorId()), "NEW_EVENT",
                    "New event created by: " + user.getFullName() , "/events/" + ev.eventId());
        }
    }

    @Async
    @EventListener
    public void onConnectionCreated(ConnectionCreatedDomainEvent ev) {
        Users user = userService.findById(ev.userId());

        Users connection = userService.findById(ev.connectionId());

        notificationService.createNotification(connection, user, ev.type(),
                ev.message() , ev.message());
    }

    @Async
    @EventListener
    @Transactional  // use for lazy loading it stays open transaction in hibernate
    public void onGroupMessageCreated(GroupMessageCreatedDomainEvent ev) {
        Users sender = userService.findById(ev.senderId());

        Optional<GroupChat> groupOptional = groupChatRepository.findByName(ev.groupName());

        if (groupOptional.isPresent()) {
            GroupChat group = groupOptional.get();

            for (Users member : group.getMembers()) {
                if (!member.getId().equals(ev.senderId())) {
                    notificationService.createNotification(
                        member,
                        sender,
                        ev.type(),
                        ev.message(),
                        "/chat/group/" + ev.groupName()
                    );
                }
            }

            if (!group.getMembers().contains(group.getAdmin()) &&
                !group.getAdmin().getId().equals(ev.senderId())) {
                notificationService.createNotification(
                    group.getAdmin(),
                    sender,
                    ev.type(),
                    ev.message(),
                    "/chat/group/" + ev.groupName()
                );
            }
        }
    }

    @Async
    @EventListener
    @Transactional
    public void onGroupInvitationCreated(GroupInvitationCreatedDomainEvent ev) {
        Users inviter = userService.findById(ev.inviterUserId());
        Users invited = userService.findById(ev.invitedUserId());

        notificationService.createNotification(
            invited,
            inviter,
            "GROUP_INVITATION",
            "You have been invited to join group: " + ev.groupName(),
            "/chat/group/" + ev.groupName()
        );
    }

    @Async
    @EventListener
    public void onConnectionRequestCreated(ConnectionRequestCreatedDomainEvent ev) {
        Users sender = userService.findById(ev.senderId());
        Users receiver = userService.findById(ev.receiverId());

        notificationService.createNotification(
            receiver,
            sender,
            "CONNECTION_REQUEST",
            "New connection request from: " + ev.senderName(),
            "/connections/requests"
        );
    }

    @Async
    @EventListener
    public void onQuestionCreated(QuestionCreatedDomainEvent ev) {
        Users author = userService.findById(ev.authorId());
        List<Users> connections = conection.getConnections(author);

        for (Users connection : connections) {
            notificationService.createNotification(
                connection,
                author,
                "NEW_QUESTION",
                "New question posted by " + ev.authorName() + ": " + ev.title(),
                "/qna/question/" + ev.questionId()
            );
        }
    }

    @Async
    @EventListener
    public void onAnswerCreated(AnswerCreatedDomainEvent ev) {
        Users answerAuthor = userService.findById(ev.authorId());
        Users questionAuthor = userService.findById(ev.questionAuthorId());

        if (!ev.authorId().equals(ev.questionAuthorId())) {
            notificationService.createNotification(
                questionAuthor,
                answerAuthor,
                "NEW_ANSWER",
                "New answer to your question by: " + ev.authorName(),
                "/qna/question/" + ev.questionId()
            );
        }

        List<Users> connections = conection.getConnections(answerAuthor);
        for (Users connection : connections) {
            if (!connection.getId().equals(ev.questionAuthorId())) {
                notificationService.createNotification(
                    connection,
                    answerAuthor,
                    "NEW_ANSWER",
                    "New answer posted by " + ev.authorName(),
                    "/qna/question/" + ev.questionId()
                );
            }
        }
    }
}
