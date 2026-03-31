package com.educonnect.chat.mapper;


import com.educonnect.chat.dto.dto.GroupRequestJoinDTO;
import com.educonnect.chat.entity.GroupRequestJoin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupRequestJoinMapper {

    @Mapping(target = "groupName", expression = "java(request.getGroup().getName())")
    GroupRequestJoinDTO toDto(GroupRequestJoin request);

    List<GroupRequestJoinDTO> toDtoList(List<GroupRequestJoin> requestJoins);

}
