package com.educonnect.chat.config;

import com.educonnect.auth.security.JwtUtils;
import com.educonnect.exceptionhandling.exception.JwtTokenExpired;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.w3c.dom.stylesheets.LinkStyle;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.http.server.ServletServerHttpRequest;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            if (request instanceof ServletServerHttpRequest servletRequest) {
                HttpServletRequest httpRequest = servletRequest.getServletRequest();

                String query = request.getURI().getQuery(); // e.g. "token=abc.def.ghi"
                query = query.split("&t=")[0];
                String token = null;

                if (query != null && query.startsWith("token=")) {
                    token = query.substring("token=".length());
                }
                System.out.println(token + "inside handshake");// 👈 Extract from URL

                if (token != null) {
                    String username = jwtUtils.extractUsername(token);
                    if (username != null && jwtUtils.validate(token, username)) {
                        Principal principal = () -> username;
                        attributes.put("user", principal);
                        return true;
                    } else {
                        throw new JwtTokenExpired("Jwt token is expired.");
                    }
                }
            }
        }
        catch(Exception e){
            System.out.println("Exception in JwtHandShakeInterceptor. " + e.getMessage());
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
        }

        return false;
    }


    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No action needed
    }


}
