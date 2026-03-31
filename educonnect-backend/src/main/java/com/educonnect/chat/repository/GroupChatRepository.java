package com.educonnect.chat.repository;


import com.educonnect.chat.entity.GroupChat;
import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {

    Optional<GroupChat> findByName(String name);

    @Query("""
            SELECT g
            FROM GroupChat g
            WHERE
            :user MEMBER OF g.members OR
            :user = g.admin
            """)
    List<GroupChat> myGroups(Users user);

    @Query("""
            SELECT g
            FROM GroupChat g
            WHERE
            LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    List<GroupChat> search(String search);

}
