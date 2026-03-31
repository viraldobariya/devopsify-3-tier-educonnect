package com.educonnect.qna.repository;

import com.educonnect.qna.dto.dto.TagDto;
import com.educonnect.qna.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByNameIgnoreCase(String name);

    @Query("""
            SELECT new com.educonnect.qna.dto.dto.TagDto(t.id, t.name, COUNT(q))
            FROM Tag t
            JOIN t.questions q
            GROUP BY t.id, t.name
            ORDER BY COUNT(q) DESC
            LIMIT :top
            """)
    List<TagDto> topTags(@Param("top") Integer top);

}
