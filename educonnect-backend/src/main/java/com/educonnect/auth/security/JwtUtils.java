package com.educonnect.auth.security;


import com.educonnect.exceptionhandling.exception.JwtTokenExpired;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    private static final String SECRET = "mZ7y+WvC3Qp5F9hVDA0Z5k8q2NaL+Xwq1GtTcVjR4Eo=";

    private SecretKey getSignedkey(){
        byte[] bytes = SECRET.getBytes();
        return Keys.hmacShaKeyFor(bytes);
    }

    public String createToken(Map<String, Object> claims, String username){
            return Jwts
                    .builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) //15 minute lifespan for expiration.
                    .signWith(getSignedkey(), SignatureAlgorithm.HS256)
                    .compact();
    }

    public String generateToken(String username){
        return createToken(new HashMap<>(), username);
    }

    private Claims extractClaims(String token) throws ExpiredJwtException {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignedkey())
                    .setAllowedClockSkewSeconds(60) // small buffer for clock skew
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new JwtTokenExpired("Jwt token expired."); // bubble up so your filter or handler can catch it
        }
    }



    private <T> T extractClaim(String token, Function<Claims, T> resolver){
        return resolver.apply(extractClaims(token));
    }

    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isExpired(String token){
        return extractExpiration(token).before(new Date(System.currentTimeMillis())) ;
    }

    public boolean validate(String token, String username){
        return !isExpired(token) && extractUsername(token).equals(username);
    }

}
