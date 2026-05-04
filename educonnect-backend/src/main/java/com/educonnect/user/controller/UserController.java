package com.educonnect.user.controller;


import com.educonnect.auth.dto.request.CheckRequest;
import com.educonnect.auth.dto.response.CheckResponse;
import com.educonnect.auth.service.AuthService;
import com.educonnect.connection.dto.general.SuggestDTO;
import com.educonnect.user.dto.request.SearchRequest;
import com.educonnect.user.dto.response.FindResponse;
import com.educonnect.user.dto.response.SuggestResponse;
import com.educonnect.user.entity.Users;
import com.educonnect.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/user/")
public class UserController {

    private final UserService userService;

    private final AuthService authService;

    public UserController(UserService userService, AuthService authService){
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping("/suggest")
    public ResponseEntity<List<SuggestDTO>> suggest(HttpServletRequest request, HttpServletResponse response){
        List<SuggestDTO> response1 = userService.suggest(request, response);
        return ResponseEntity.status(HttpStatus.OK).body(response1);
    }

    @GetMapping(value="/find", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FindResponse> find(@RequestParam("username") String username){
        FindResponse res = userService.find(username);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Users> update(@RequestPart("user") Users user, @RequestPart(value = "avatar", required = false) MultipartFile file ){
        Users res = userService.update(user, file);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/check-update-availability")
    public ResponseEntity<CheckResponse> checkUpdate(HttpServletRequest request, HttpServletResponse response, @RequestBody CheckRequest requestData){
        System.out.println(requestData.getUsername() + requestData.getEmail());
        CheckResponse res =  userService.checkUpdate(request, response, requestData);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/search")
    public ResponseEntity<Page<SuggestDTO>> search(HttpServletRequest request, HttpServletResponse response, @RequestBody SearchRequest requestData){
        Page<SuggestDTO> users = userService.search(request, response, requestData);
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @GetMapping("/search-by-username")
    public ResponseEntity<List<Users>> searchByUsername(@RequestParam String search){
        List<Users> users = userService.findByUsername(search);
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @GetMapping("/chat-users")
    public ResponseEntity<List<Users>> getChatUsers(HttpServletRequest request, HttpServletResponse response){
        Users currentUser = authService.me(request, response);
        List<Users> users = userService.chatUsers(currentUser);
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

}