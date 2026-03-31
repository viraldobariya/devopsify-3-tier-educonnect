package com.educonnect.auth.controller;


import com.educonnect.auth.dto.request.CheckRequest;
import com.educonnect.auth.dto.request.LoginRequest;
import com.educonnect.auth.dto.request.SignUpRequest;
import com.educonnect.auth.dto.response.*;
import com.educonnect.auth.security.JwtUtils;
import com.educonnect.auth.service.AuthService;
import com.educonnect.auth.service.RefreshTokenService;
import com.educonnect.user.entity.Users;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth/")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/check-availability")
    public ResponseEntity<CheckResponse> checkAvailability(@RequestBody CheckRequest request){
        CheckResponse response = new CheckResponse(authService.checkAvailability(request.getUsername(), request.getEmail()));

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping(value = "/sign-up", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SignUpResponse> signUp(@RequestPart("user") SignUpRequest request, @RequestPart("avatar") MultipartFile file){
        System.out.println(request);
        System.out.println(request + file.getName() + file.getSize());
        SignUpResponse response = new SignUpResponse(authService.signUp(request, file));

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(HttpServletRequest request, HttpServletResponse response, @RequestBody LoginRequest requestData){
        LoginResponse responseData = authService.login(request, response, requestData);

        return ResponseEntity.status(HttpStatus.OK).body(responseData);
    }

    @PostMapping("/get-refresh")
    public ResponseEntity<GetRefreshTokenResponse> getRefreshToken(HttpServletRequest request, HttpServletResponse response){
        GetRefreshTokenResponse res = authService.getRefreshToken(request, response);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/logout")
    public ResponseEntity logout(HttpServletRequest request, HttpServletResponse response){
        authService.logout(request, response);
        return ResponseEntity.ok(null);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(HttpServletRequest request, HttpServletResponse response){
        RefreshTokenResponse res = authService.refreshToken(request, response);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me(HttpServletRequest request, HttpServletResponse response){
        LoginResponse response1 = new LoginResponse(authService.me(request, response), null);

        return ResponseEntity.status(HttpStatus.OK).body(response1);

    }

}






