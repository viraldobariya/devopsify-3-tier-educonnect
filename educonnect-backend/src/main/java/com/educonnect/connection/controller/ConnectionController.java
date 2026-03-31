package com.educonnect.connection.controller;


import com.educonnect.auth.service.AuthService;
import com.educonnect.connection.dto.general.ConnectedDTO;
import com.educonnect.connection.dto.general.PendingDTO;
import com.educonnect.connection.dto.request.SendRequest;
import com.educonnect.connection.entity.Connection;
import com.educonnect.connection.service.ConnectionService;
import com.educonnect.user.entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;




@RestController
@RequestMapping("/api/connection")
public class ConnectionController {

    private ConnectionService connectionService;

    private AuthService authService;

    public ConnectionController(ConnectionService connectionService, AuthService authService){
        this.connectionService = connectionService;
        this.authService = authService;
    }

    @PostMapping("/send")
    public ResponseEntity sendRequest(HttpServletRequest request, HttpServletResponse response, @RequestBody SendRequest requestData){
        connectionService.sendRequest(request, response, requestData);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingDTO>> pendingRequest(HttpServletRequest request, HttpServletResponse response){
        List<PendingDTO> connections = connectionService.pendingRequest(request, response);
        return ResponseEntity.status(HttpStatus.OK).body(connections);
    }

    @PostMapping("/accept")
    public ResponseEntity acceptRequest(HttpServletRequest request, HttpServletResponse response, @RequestBody SendRequest requestData){
        connectionService.acceptRequest(request, response, requestData);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PostMapping("/reject")
    public ResponseEntity rejectRequest(HttpServletRequest request, HttpServletResponse response, @RequestBody SendRequest requestData){
        connectionService.rejectRequest(request, response, requestData);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/status")
    public ResponseEntity<List<ConnectedDTO>> getStatus(HttpServletRequest request, HttpServletResponse response){
        List<ConnectedDTO> res = connectionService.getStatus(request, response);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping("/status-by-id/{id}")
    public ResponseEntity<String> getStatusById(HttpServletRequest request, HttpServletResponse response, @PathVariable("id")UUID id){
        String res = connectionService.getStatusById(request, response, id);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping("/connections")
    public ResponseEntity<List<Users>> getConnections(HttpServletRequest request, HttpServletResponse response){
        Users currentUser = authService.me(request, response);
        List<Users> res = connectionService.getConnections(currentUser);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

}
