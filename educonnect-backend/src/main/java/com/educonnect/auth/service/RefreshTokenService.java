package com.educonnect.auth.service;


import com.educonnect.auth.entity.RefreshToken;
import com.educonnect.auth.repository.RefreshTokenRepository;
import com.educonnect.exceptionhandling.exception.InvalidCredentialsException;
import com.educonnect.user.entity.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    RefreshTokenRepository refreshTokenRepository;

    @Autowired
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository){
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String create(Users user){
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiry(Instant.now().plusMillis(1000*60*60*24*5))
                .build();
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    public Users checkToken(String refreshToken){
        Optional<RefreshToken> token = refreshTokenRepository.findByToken(refreshToken);
        if (token.isEmpty() || token.get().getExpiry().isBefore(Instant.now())){
            throw new InvalidCredentialsException("RefreshToken is invalid.");
        }
        return token.get().getUser();
    }

    public void logout(String token){
        refreshTokenRepository.deleteByToken(token);
    }
}
