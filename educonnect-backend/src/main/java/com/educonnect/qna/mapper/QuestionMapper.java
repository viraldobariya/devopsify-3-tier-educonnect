package com.educonnect.qna.mapper;

import com.educonnect.qna.dto.dto.MyQuestionDto;
import com.educonnect.qna.dto.dto.QuestionSearchDto;
import com.educonnect.qna.dto.dto.QuestionWholeDto;
import com.educonnect.qna.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses={TagMapper.class, AnswerMapper.class})
public interface QuestionMapper {

    @Mapping(target = "tags", source="tags")
    MyQuestionDto toMyDto(Question question);

    List<MyQuestionDto> toMyDtoList(List<Question> questions);

    @Mapping(target = "isAccepted", expression = "java(question.getAcceptedAnswer() != null)")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "noOfAnswers", expression = "java(Long.valueOf(question.getAnswers().size()))")
    @Mapping(target = "votes", expression = "java(Long.valueOf(question.getVotes().stream().map(vote -> vote.getValue()).reduce(0, (acc, el) -> acc + el)))")
    QuestionSearchDto toSearchDto(Question question);

    List<QuestionSearchDto> toSearchDtoList(List<Question> questions);

    @Mapping(target = "userVote", expression = "java(null)")
    @Mapping(target = "voteCount", expression = "java(Long.valueOf(question.getVotes().stream().map(vote -> vote.getValue()).reduce(0, (acc, el) -> acc + el)))")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "answers", source = "answers")
    QuestionWholeDto toWholeDto(Question question);

}
