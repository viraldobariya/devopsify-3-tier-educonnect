package com.educonnect.user.repository;

import com.educonnect.user.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<Users, UUID> {

    Users findByUsername(String username);

    @Query("SELECT COUNT(u) = 0 FROM Users u WHERE u.username = :username OR u.email = :email")
    boolean checkByUsernameAndEmail(@Param("username") String username, @Param("email") String email);

    @Query("SELECT u FROM Users u WHERE u.username = :username OR u.email = :email")
    Optional<Users> getByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    @Query("""
            SELECT u FROM Users u
            WHERE u.id <> :userId
            """)
    List<Users> suggest(@Param("userId") UUID userId);

    @Query("SELECT COUNT(u) FROM Users u WHERE (u.username = :username1 AND u.username != :username2) OR (u.email = :email1 AND u.email != :email2) ")
    long checkUpdate(String username1, String email1, String username2, String email2);


    @Query("""
        SELECT DISTINCT u.id
        FROM Users u
        LEFT JOIN u.skills s
        WHERE (
            :search = '' OR (
                LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(SUBSTRING(u.email, 1, LOCATE('@', u.email) - 1)) LIKE LOWER(CONCAT('%', :search, '%'))
            )
        )
        AND (:university IS NULL OR u.university = :university)
        AND (:course IS NULL OR u.course = :course)
        AND (
            :skills IS NULL OR :#{#skills.isEmpty()} = true OR s IN :skills
        )
    """)
        Page<UUID> searchUserIds(
                @Param("search") String search,
                @Param("university") Users.University university,
                @Param("course") Users.Course course,
                @Param("skills") List<Users.Skill> skills,
                Pageable pageable
        );

    List<Users> findByIdIn(List<UUID> ids);



    @Query("""
            SELECT
            u
            FROM Users u
            WHERE
            LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    List<Users> searchByUsername(String search);

    @Query(value = """
    SELECT DISTINCT ON (partner_id) u.*
    FROM (
        SELECT
            *,
            CASE
                WHEN sender_id = :userId THEN receiver_id
                ELSE sender_id
            END AS partner_id
        FROM private_chat_message
        WHERE sender_id = :userId OR receiver_id = :userId
    ) AS sub
    JOIN users u ON sub.partner_id = u.id
    ORDER BY partner_id, timestamp DESC
    """, nativeQuery = true)
    List<Users> getChatUsers(@Param("userId") UUID userId);






}
