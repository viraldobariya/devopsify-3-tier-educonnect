package com.educonnect.event.controller;

import com.educonnect.auth.service.AuthService;
import com.educonnect.event.model.Ticket;
import com.educonnect.event.repo.TickerRepo;
import com.educonnect.event.service.PdfService;
import com.educonnect.user.entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/pdf")
public class PdfController {
    private final PdfService pdfService;

    @Autowired
    private TickerRepo trepo;

    @Autowired
    private AuthService authService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping("/download_ticket")
    public ResponseEntity<byte[]> getInvoicePdf(
            @RequestParam Long registrationId) {
        try {

            byte[] pdfBytes = pdfService.generatePdf(registrationId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=ticket.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("Error generating PDF: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}