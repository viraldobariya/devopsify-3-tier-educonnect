package com.educonnect.chat.mapper;


import com.educonnect.chat.dto.dto.GroupChatMessageDTO;
import com.educonnect.chat.entity.GroupChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupChatMessageMapper {

    @Mapping(target = "groupName", expression = "java(message.getGroupChat().getName())")
    GroupChatMessageDTO toDto(GroupChatMessage message);

    List<GroupChatMessageDTO> toDtoList(List<GroupChatMessage> messages);

}
