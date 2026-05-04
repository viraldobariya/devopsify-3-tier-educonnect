package com.educonnect.chat.repository;

import com.educonnect.chat.entity.GroupChat;
import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.chat.entity.PrivateChatMessage;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {

    @Query("""
            SELECT
            m
            FROM GroupChatMessage m
            WHERE
            m.groupChat = :groupChat
            ORDER BY
            timestamp ASC
            """)
    List<GroupChatMessage> getMessages( GroupChat groupChat);
}
