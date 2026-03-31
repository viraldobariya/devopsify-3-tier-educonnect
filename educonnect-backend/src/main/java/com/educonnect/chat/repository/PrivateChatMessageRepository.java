package com.educonnect.chat.repository;


import com.educonnect.chat.entity.PrivateChatMessage;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateChatMessageRepository extends JpaRepository<PrivateChatMessage, Long>{

    @Query("""
            SELECT
            m
            FROM PrivateChatMessage m
            WHERE
            (m.sender = :sender AND m.receiver = :receiver) OR
            (m.receiver = :sender AND m.sender = :receiver)
            """)
    List<PrivateChatMessage> chatWith(Users sender, Users receiver);
}