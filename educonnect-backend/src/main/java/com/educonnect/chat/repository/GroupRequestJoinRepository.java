package com.educonnect.chat.repository;


import com.educonnect.chat.entity.GroupChat;
import com.educonnect.chat.entity.GroupChatMessage;
import com.educonnect.chat.entity.GroupRequestJoin;
import com.educonnect.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRequestJoinRepository extends JpaRepository<GroupRequestJoin, Long> {

    GroupRequestJoin findBySenderAndGroup(Users sender, GroupChat groupChat);

    List<GroupRequestJoin> findBySenderAndInvited(Users sender, boolean invited);

    List<GroupRequestJoin> findByGroupAndInvited(GroupChat sender, boolean invited);

    List<GroupRequestJoin> findByGroup(GroupChat groupChat);

}