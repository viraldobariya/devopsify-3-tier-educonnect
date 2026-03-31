package com.educonnect.chat.mapper;


import com.educonnect.chat.dto.dto.GroupChatDTO;
import com.educonnect.chat.entity.GroupChat;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupChatMapper {

    GroupChatDTO toDto(GroupChat groupChat);

    List<GroupChatDTO> toDtoList(List<GroupChat> groupChats);

}
