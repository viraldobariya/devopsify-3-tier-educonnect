package com.educonnect.connection.repository;

import com.educonnect.connection.dto.general.ConnectedDTO;
import com.educonnect.connection.entity.Connection;
import com.educonnect.user.entity.Users;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface ConnectionRepository extends JpaRepository<Connection, UUID> {

    @Query("SELECT c FROM Connection c WHERE c.status = 'PENDING' AND c.receiver = :user ORDER BY c.createdAt DESC")
    List<Connection> findPending(@Param("user") Users user);

    @Query("SELECT COUNT(c) > 0 FROM Connection c WHERE (c.sender = :sender AND c.receiver = :receiver) OR (c.receiver = :sender AND c.sender = :receiver)")
    boolean check(@Param("sender") Users sender, @Param("receiver") Users receiver);

    @Query("SELECT COUNT(c) > 0 FROM Connection c WHERE (c.sender = :sender AND c.receiver = :receiver AND c.status = :status)")
    boolean checkWithStatus(@Param("sender") Users sender, @Param("receiver") Users receiver, @Param("status") Connection.RequestStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE Connection c SET c.status = :status WHERE c.sender = :sender AND c.receiver = :receiver")
    void update(@Param("sender") Users sender, @Param("receiver") Users receiver, @Param("status") Connection.RequestStatus status);

    @Query("""
            SELECT
                new com.educonnect.connection.dto.general.ConnectedDTO(c.sender, c.receiver, c.status)
                FROM Connection c
                WHERE c.sender.id = :userId OR c.receiver.id = :userId
            """)
    List<ConnectedDTO> getStatus(UUID userId);

    @Query("""
            SELECT
                c
                FROM Connection c
                WHERE (c.sender.id = :userId AND c.receiver.id = :friendId) OR (c.sender.id = :friendId AND c.receiver.id = :userId)
            """)
    Optional<Connection> findStatusById(UUID userId, UUID friendId);

    Optional<Connection> findBySenderAndReceiver(Users sender, Users receiver);

    @Query("SELECT c.sender FROM Connection c WHERE c.receiver = :user AND c.status = 'ACCEPTED'")
    List<Users> findConnectionsWhereUserIsReceiver(@Param("user") Users user);

    @Query("SELECT c.receiver FROM Connection c WHERE c.sender = :user AND c.status = 'ACCEPTED'")
    List<Users> findConnectionsWhereUserIsSender(@Param("user") Users user);


}
