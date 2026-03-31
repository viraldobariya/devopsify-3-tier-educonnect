package com.educonnect.qna.mapper;


import com.educonnect.qna.dto.dto.AnswerDto;
import com.educonnect.qna.entity.Answer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface AnswerMapper {

    @Mapping(target = "userVote", expression = "java(null)")
    @Mapping(target = "voteCount", expression = "java(Long.valueOf(answer.getVotes() != null ? answer.getVotes().stream().map(vote -> vote.getValue()).reduce(0, (acc, el) -> acc + el) : 0))")
    AnswerDto toDto(Answer answer);

    List<AnswerDto> toDtoList(List<Answer> answers);

    Set<AnswerDto> toDtoSet(Set<Answer> answers);

}
