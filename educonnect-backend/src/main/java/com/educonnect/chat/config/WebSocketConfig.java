package com.educonnect.chat.config;
//
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.messaging.Message;
//import org.springframework.messaging.MessageChannel;
//import org.springframework.messaging.simp.config.ChannelRegistration;
//import org.springframework.messaging.simp.config.MessageBrokerRegistry;
//import org.springframework.messaging.simp.stomp.StompCommand;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.messaging.support.ChannelInterceptor;
//import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
//import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
//import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
//
//import java.security.Principal;
//
//@Configuration
//@EnableWebSocketMessageBroker
//public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//
//    JwtHandshakeInterceptor jwtHandshakeInterceptor;
//
//    public WebSocketConfig(JwtHandshakeInterceptor jwtHandshakeInterceptor){
//        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
//    }
//
//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry registry){
//        registry.enableSimpleBroker("/queue", "/topic");
//        registry.setApplicationDestinationPrefixes("/app");
//        registry.setUserDestinationPrefix("/user");
//    }
//
//    @Override
//    public void registerStompEndpoints(StompEndpointRegistry registry){
//        registry.addEndpoint("/ws")
//                .setAllowedOriginPatterns("*")
//                .addInterceptors(jwtHandshakeInterceptor)
//                .withSockJS();
//    }
//
//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        registration.interceptors(new ChannelInterceptor() {
//            @Override
//            public Message<?> preSend(Message<?> message, MessageChannel channel) {
//                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
//
//                // Log all incoming messages
//                System.out.println("STOMP Command: " + accessor.getCommand());
//                System.out.println("Destination: " + accessor.getDestination());
//                System.out.println("Session ID: " + accessor.getSessionId());
//                System.out.println("User: " + (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
//
//                Principal user = (Principal) accessor.getSessionAttributes().get("user");
//                accessor.setUser(user);
//                System.out.println(accessor.getUser() + "user");
//                return message;
//            }
//        });
//    }
//
//
//
//
//}




import java.security.Principal;
import java.util.Map;

import com.educonnect.auth.security.JwtUtils;
import com.educonnect.exceptionhandling.exception.JwtTokenExpired;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;


@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(jwtHandshakeInterceptor)
                .setHandshakeHandler(defaultHandshakeHandler())
                .withSockJS();
//        registry
//                .addEndpoint("/ws-notifications")
//                .setAllowedOriginPatterns("*")
//                .addInterceptors(jwtHandshakeInterceptor)
//                .setHandshakeHandler(defaultHandshakeHandler())
//                .withSockJS();
    }

//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        registration.interceptors(new HttpHandshakeInterceptor());
//    }
//
//    public class HttpHandshakeInterceptor implements ChannelInterceptor {
//
//        @Override
//        public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message,
//                                                                MessageChannel channel) {
//            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
//            if (accessor.getCommand().equals(StompCommand.CONNECT)) {
//                String token = accessor.getFirstNativeHeader("Authorization");
//                System.out.println("token is " + token);
//                if (token == null){
//                    throw new JwtTokenExpired("Token is not there.");
//                }
//                String newtoken = token.substring(7);
//                String username = jwtUtils.extractUsername(newtoken);
//                if (username != null && !jwtUtils.isExpired(newtoken)){
//                    Principal principal = () -> username;
//                    accessor.setUser(principal);
//                    accessor.getSessionAttributes().put("user", principal);
//                    System.out.println(accessor.getUser().getName() + ( accessor.getSessionAttributes().get("user") != null ? accessor.getSessionAttributes().get("user") : "nulla") );
//                }
//                else{
//                    throw new JwtTokenExpired("Jwt token is expired.");
//                }
//            }
//            return message;
//        }
//    }

    @Bean
    public DefaultHandshakeHandler defaultHandshakeHandler() {
        return new DefaultHandshakeHandler() {
            @Override
            protected Principal determineUser(ServerHttpRequest request,
                                              WebSocketHandler wsHandler,
                                              Map<String, Object> attributes) {
                return (Principal) attributes.get("user");
            }
        };
    }

}