package com.educonnect.auth.service;


import com.educonnect.auth.dto.request.LoginRequest;
import com.educonnect.auth.dto.request.SignUpRequest;
import com.educonnect.auth.dto.response.GetRefreshTokenResponse;
import com.educonnect.auth.dto.response.LoginResponse;
import com.educonnect.auth.dto.response.RefreshTokenResponse;
import com.educonnect.auth.security.JwtUtils;
import com.educonnect.exceptionhandling.exception.*;
import com.educonnect.user.entity.Users;
import com.educonnect.user.repository.UserRepository;
import com.educonnect.utils.EmailValidationUtil;
import com.educonnect.utils.PasswordValidationUtil;
import com.educonnect.utils.aws.s3.S3FileUploadUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class AuthService {

    private final S3FileUploadUtil s3FileUploadUtil;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtils jwtUtils;

    private final RefreshTokenService refreshTokenService;

    @Autowired
    public AuthService(UserRepository userRepository, S3FileUploadUtil s3FileUploadUtil, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, RefreshTokenService refreshTokenService){
        this.userRepository = userRepository;
        this.s3FileUploadUtil = s3FileUploadUtil;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
    }

    public boolean checkAvailability(String username, String email){
        if (username == null || email == null || !EmailValidationUtil.isValid(email)){
            return false;
        }
        return userRepository.checkByUsernameAndEmail(username, email);
    }

    public Users signUp(SignUpRequest request, MultipartFile file){
        if(request.getFullName() == null || !PasswordValidationUtil.checkPassword(request.getPassword()) || request.getRole() == null || request.getUsername() == null || request.getEmail() == null || request.getCourse() == null || request.getUniversity() == null || request.getSkills() == null){
            throw new BusinessRuleViolationException("Request contains nulls or Undigestable values.");
        }
        if(file.getSize() > 1024 * 1024 * 1){
            throw new FileSizeExceeded("Image size should be of maximum 1MB.");
        }

        String avatar;

        try{
            avatar = s3FileUploadUtil.uploadImage(file);
        }
        catch(Exception ex){
            throw new FileUploadException("Something happened while uploading file.");
        }

        Users user = new Users();
        user.setAvatar(avatar);
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setCourse(request.getCourse());
        user.setUniversity(request.getUniversity());
        user.setSkills(request.getSkills());

        return userRepository.save(user);
    }

    public LoginResponse login(HttpServletRequest request, HttpServletResponse response, LoginRequest requestData){
        String username = requestData.getUsername();
        String email = requestData.getEmail();
        String password = requestData.getPassword();

        if ((username == null && email == null) || password == null){
            throw new BusinessRuleViolationException("Null Attributes got.");
        }


        Optional<Users> user = userRepository.getByUsernameOrEmail(username, email);

        if (user.isEmpty() || !passwordEncoder.matches(password, user.get().getPassword())){
            throw new InvalidCredentialsException("Login credentials are not valid.");
        }

        String refreshToken = refreshTokenService.create(user.get());

        response.setHeader("Set-Cookie", "refreshToken=" + refreshToken + "; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800;");

        String accessToken = jwtUtils.generateToken(user.get().getUsername());

        return new LoginResponse(user.get(), accessToken);

    }

    public RefreshTokenResponse refreshToken(HttpServletRequest request, HttpServletResponse response){
        Cookie[] cookies = request.getCookies();
        if (cookies != null){
            for(Cookie cookie : cookies){
                if (cookie.getName().equals("refreshToken")){
                    Users user = refreshTokenService.checkToken(cookie.getValue());
                    return new RefreshTokenResponse(jwtUtils.generateToken(user.getUsername()));
                }
            }
        }
        throw new InvalidCredentialsException("Refresh token is invalid.");
    }

    public void logout(HttpServletRequest request, HttpServletResponse response){
        Cookie[] cookies = request.getCookies();
        if (cookies != null){
            for(Cookie cookie : cookies){
                if (cookie.getName().equals("refreshToken")){
                    refreshTokenService.logout(cookie.getValue());
                    response.setHeader("Set-Cookie", "refreshToken=" + cookie.getValue() + "; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
                }
            }
        }
    }

    public GetRefreshTokenResponse getRefreshToken(HttpServletRequest request, HttpServletResponse response){
        Cookie[] cookies = request.getCookies();
        if (cookies != null){
            for(Cookie cookie : cookies){
                if (cookie.getName().equals("refreshToken")){
                    String refreshToken = cookie.getValue();
                    return new GetRefreshTokenResponse(refreshToken);
                }
            }
        }

        throw new InvalidCredentialsException("Invalid refresh token.");
    }

    public Users me(HttpServletRequest request, HttpServletResponse response){
        String accessToken = request.getHeader("Authorization");
        if (accessToken == null || !accessToken.startsWith("Bearer ")){
            throw new JwtTokenExpired("Jwt token expired.");
        }
        accessToken = accessToken.substring(7);
        String username = jwtUtils.extractUsername(accessToken);
        Users user = userRepository.findByUsername(username);

        if (user==null){
            throw new UsernameNotFoundException("Username not found");
        }

        return user;
    }

}
