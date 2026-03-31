package com.educonnect.notifications.controller;


import com.educonnect.auth.service.AuthService;
import com.educonnect.notifications.dto.requests.MarkSeenRequest;
import com.educonnect.notifications.dto.responses.MarkSeenResponse;
import com.educonnect.notifications.dto.responses.NotificationResponse;
import com.educonnect.notifications.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService; // helper to get current user id

    @GetMapping
    public Page<NotificationResponse> getNotifications(HttpServletRequest request, HttpServletResponse response , @RequestParam(defaultValue="0") int page,
                                                       @RequestParam(defaultValue="20") int size) {
        UUID userId = authService.me(request, response).getId();
        return notificationService.listNotifications(userId, page, size);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(HttpServletRequest request, HttpServletResponse response) {
        return notificationService.getUnreadCount(authService.me(request , response).getId());
    }

    @PostMapping("/mark-all-seen")
    public ResponseEntity<Void> markAllSeen(HttpServletRequest request, HttpServletResponse response) {
        notificationService.markAllAsSeen(authService.me(request , response).getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-seen")
    public ResponseEntity<MarkSeenResponse> markSeen(@RequestBody MarkSeenRequest request){
        notificationService.markAsRead(request.getNid());
        return ResponseEntity.ok(new MarkSeenResponse(request.getNid()));
    }
}
