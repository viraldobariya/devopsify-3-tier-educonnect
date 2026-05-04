package com.educonnect.connection.service;


import com.educonnect.auth.service.AuthService;
import com.educonnect.connection.dto.general.ConnectedDTO;
import com.educonnect.connection.dto.general.PendingDTO;
import com.educonnect.connection.dto.request.SendRequest;
import com.educonnect.connection.entity.Connection;
import com.educonnect.connection.repository.ConnectionRepository;
import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.exceptionhandling.exception.InvalidCredentialsException;
import com.educonnect.exceptionhandling.exception.JwtTokenExpired;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ConnectionService {

    
    
    private final ConnectionRepository connectionRepository;

    private final UserRepository userRepository;

    private final AuthService authService;

    private final ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    public ConnectionService(ConnectionRepository connectionRepository, UserRepository userRepository, AuthService authService , ApplicationEventPublisher applicationEventPublisher){
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void sendRequest(HttpServletRequest request, HttpServletResponse response, SendRequest requestData){

        Users sender = authService.me(request, response);

        if (sender == null){
            throw new JwtTokenExpired("Jwt token expired.");
        }

        if(requestData.getId() == null){
            throw new BusinessRuleViolationException("Null value not allowed.");
        }

        Optional<Users> receiver = userRepository.findById(requestData.getId());

        if (receiver.isEmpty()){
            throw new InvalidCredentialsException("Invalid username");
        }

        boolean isExists = connectionRepository.check(sender, receiver.get());

        if (isExists){
            throw new BusinessRuleViolationException("Duplicate Data found.");
        }

        Connection connection = Connection
                .builder()
                .sender(sender)
                .receiver(receiver.get())
                .status(Connection.RequestStatus.PENDING)
                .build();

        // Publish connection request event for notifications
        applicationEventPublisher.publishEvent(
                new ConnectionRequestCreatedDomainEvent(sender.getId(), receiver.get().getId(), sender.getFullName())
        );

        connectionRepository.save(connection);
    }

    public List<PendingDTO> pendingRequest(HttpServletRequest request, HttpServletResponse response){
        Users user = authService.me(request, response);

        if (user == null){
            throw new JwtTokenExpired("Jwt token expired.");
        }

        List<Connection> connections = connectionRepository.findPending(user);

        List<PendingDTO> pendings = connections.stream().map(con -> new PendingDTO(con.getSender())).toList();

        return pendings;
    }

    public void acceptRequest(HttpServletRequest request, HttpServletResponse response, SendRequest requestData){
        Users receiver = authService.me(request, response);

        if (receiver == null){
            throw new JwtTokenExpired("Jwt token expired.");
        }

        Optional<Users> sender = userRepository.findById(requestData.getId());

        if (sender.isEmpty()){
            throw new InvalidCredentialsException("Invalid credentials.");
        }

        boolean isExists = connectionRepository.checkWithStatus(sender.get(), receiver, Connection.RequestStatus.PENDING);

        if (!isExists){
            throw new BusinessRuleViolationException("Pending request not found.");
        }

        applicationEventPublisher.publishEvent(
                new ConnectionCreatedDomainEvent(sender.get().getId() ,receiver.getId() , "Request_Accepted" , "Connection Request Accept By : " + receiver.getFullName() , "/profile/" + receiver.getId())
        );

        connectionRepository.update(sender.get(), receiver, Connection.RequestStatus.ACCEPTED);
    }

    public void rejectRequest(HttpServletRequest request, HttpServletResponse response, SendRequest requestData){
        Users receiver = authService.me(request, response);

        if (receiver == null){
            throw new JwtTokenExpired("Jwt token expired.");
        }

        Optional<Users> sender = userRepository.findById(requestData.getId());

        if (sender.isEmpty()){
            throw new InvalidCredentialsException("Invalid username.");
        }

        boolean isExists = connectionRepository.checkWithStatus(sender.get(), receiver, Connection.RequestStatus.PENDING);

        if (!isExists){
            throw new BusinessRuleViolationException("Pending request not found.");
        }

        Optional<Connection> connection = connectionRepository.findBySenderAndReceiver(sender.get(), receiver);

        if (connection.isEmpty()){
            throw new BusinessRuleViolationException("Request doesn't exists.");
        }
        applicationEventPublisher.publishEvent(
                new ConnectionCreatedDomainEvent( sender.get().getId() ,receiver.getId()  , "Request_Rejected" , "Connection Request Reject By : " + receiver.getFullName() , "/profile/" + receiver.getId())
        );
        connectionRepository.deleteById(connection.get().getId());

    }

    public List<ConnectedDTO> getStatus(HttpServletRequest request, HttpServletResponse response){
        Users user = authService.me(request, response);

        List<ConnectedDTO> connections = connectionRepository.getStatus(user.getId());

        return connections;
    }

    public String getStatusById(HttpServletRequest request, HttpServletResponse response, UUID id){


        Users user = authService.me(request, response);

        Optional<Connection> con = connectionRepository.findStatusById(user.getId(), id);


        if (con.isEmpty()){
            return "NEVER";
        }

        Connection newCon = con.get();

        if (newCon.getStatus() == Connection.RequestStatus.ACCEPTED) return "CONNECTED";

        if (newCon.getStatus() == Connection.RequestStatus.PENDING){
            if (newCon.getSender().getId().compareTo(user.getId()) == 0) return "PENDING";
            else return "ACCEPT";
        }

        return con.get().getStatus().name();
    }

    public List<Users> getConnections(Users user){
        List<Users> a = connectionRepository.findConnectionsWhereUserIsReceiver(user);
        List<Users> b = connectionRepository.findConnectionsWhereUserIsSender(user);
        a.addAll(b);
        return a;    }

}
