package com.educonnect.qna.mapper;


import com.educonnect.qna.dto.dto.TagDto;
import com.educonnect.qna.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface TagMapper {

    @Mapping(target="count", expression = "java(Long.valueOf(tag.getQuestions().size()))")
    TagDto toDto(Tag tag);

    Set<TagDto> toDtoSet(Set<Tag> tags);

    List<TagDto> toDtoList(List<Tag> tags);

}
