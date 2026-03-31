package com.educonnect.event.service;

import com.educonnect.event.model.Ticket;
import com.educonnect.event.repo.TickerRepo;
import com.educonnect.event.utility.QRCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class PdfService {
    private final TemplateEngine templateEngine;

    @Autowired
    private TickerRepo tickerRepo;

    public PdfService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdf(Long registrationId) throws Exception {
        // Get ticket that allows PDF generation (canGeneratePdf = true)
        Ticket ticket = tickerRepo.findByRegistrationIdAndCanGeneratePdfTrue(registrationId)
                .orElseThrow(() -> new RuntimeException("Ticket not found or PDF generation not allowed"));

        // Validate required fields
        validateTicketForPdfGeneration(ticket);

        // Create context and populate all template variables
        Context context = new Context();

        // Basic ticket information
        context.setVariable("ticketNumber", ticket.getId().toString());
        context.setVariable("ticketStatus", ticket.getTicketStatusDisplay());

        // Holder information from ticket
        context.setVariable("holderName", ticket.getHolderName());
        context.setVariable("holderEmail", ticket.getHolderEmail());
        context.setVariable("holderUniversity",
                ticket.getHolderUniversity() != null ? ticket.getHolderUniversity().toString() : "Not specified");

        // Event information from ticket
        context.setVariable("eventTitle", ticket.getEventTitle());
        context.setVariable("eventLocation", ticket.getEventLocation());
        context.setVariable("eventDescription",
                ticket.getEventDescription() != null ? ticket.getEventDescription() : "No description available");

        // Use the correct method name from Ticket.java
        context.setVariable("eventDuration", ticket.getFormattedEventDuration());

        // Date formatting for template
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

        // Separate date and time fields for template with null checks
        if (ticket.getEventStartDate() != null) {
            context.setVariable("eventStartDate", ticket.getEventStartDate().format(dateFormatter));
            context.setVariable("eventStartTime", ticket.getEventStartDate().format(timeFormatter));
        } else {
            context.setVariable("eventStartDate", "TBD");
            context.setVariable("eventStartTime", "TBD");
        }

        if (ticket.getEventEndDate() != null) {
            context.setVariable("eventEndDate", ticket.getEventEndDate().format(dateFormatter));
            context.setVariable("eventEndTime", ticket.getEventEndDate().format(timeFormatter));
        } else {
            context.setVariable("eventEndDate", "TBD");
            context.setVariable("eventEndTime", "TBD");
        }

        // Ticket dates with null checks
        context.setVariable("issueDate",
                ticket.getIssueDate() != null ?
                        ticket.getIssueDate().format(dateTimeFormatter) : "Not issued");

        context.setVariable("activationDate",
                ticket.getActivationDate() != null ?
                        ticket.getActivationDate().format(dateTimeFormatter) : "Not activated");

        // Organizer information with null checks
        context.setVariable("organizerName",
                ticket.getOrganizerName() != null ? ticket.getOrganizerName() : "Not specified");
        context.setVariable("organizerContact",
                ticket.getOrganizerContact() != null ? ticket.getOrganizerContact() : "Not specified");

        // Special instructions
        context.setVariable("specialInstructions",
                ticket.getSpecialInstructions() != null ? ticket.getSpecialInstructions() : "No special instructions");

        // System IDs for tracking with null checks
        context.setVariable("userId",
                ticket.getUser() != null ? ticket.getUser().getId().toString() : "N/A");
        context.setVariable("eventId",
                ticket.getEvent() != null ? ticket.getEvent().getId().toString() : "N/A");
        context.setVariable("registrationId",
                ticket.getRegistration() != null ? ticket.getRegistration().getId().toString() : "N/A");

        // Print date
        context.setVariable("printDate", java.time.LocalDateTime.now().format(dateTimeFormatter));

        // Legacy variables for backwards compatibility
        context.setVariable("name", ticket.getHolderName());
        context.setVariable("eventname", ticket.getEventTitle());

        // Generate QR Code
        byte[] qr = QRCodeGenerator.generateQRCode(String.valueOf(ticket.getId()));
        if (qr == null || qr.length == 0) {
            throw new RuntimeException("Failed to generate QR code");
        }
        String qrBase64 = Base64.getEncoder().encodeToString(qr);
        context.setVariable("qrCode", qrBase64);

        // Generate HTML content from template
        String htmlContent = templateEngine.process("regticket", context);

        // Clean HTML for XHTML compliance
        htmlContent = cleanHtmlForPdf(htmlContent);

        // Convert HTML to PDF
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    /**
     * Clean HTML to make it XHTML compliant for Flying Saucer PDF generation
     */
    private String cleanHtmlForPdf(String htmlContent) {
        // Fix unclosed tags
        htmlContent = htmlContent.replace("<br>", "<br/>");
        htmlContent = htmlContent.replace("<hr>", "<hr/>");
        htmlContent = htmlContent.replace("<img", "<img");

        htmlContent = htmlContent.replace("& ", "&amp; ");

        // Ensure proper XML declaration
        if (!htmlContent.contains("<?xml")) {
            htmlContent = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + htmlContent;
        }

        return htmlContent;
    }

    private void validateTicketForPdfGeneration(Ticket ticket) {
        if (ticket == null) {
            throw new RuntimeException("Ticket cannot be null");
        }

        if (!ticket.isCanGeneratePdf()) {
            throw new RuntimeException("PDF generation is not allowed for this ticket");
        }

        if (ticket.getHolderName() == null || ticket.getHolderName().trim().isEmpty()) {
            throw new RuntimeException("Ticket holder name is required");
        }

        if (ticket.getEventTitle() == null || ticket.getEventTitle().trim().isEmpty()) {
            throw new RuntimeException("Event title is required");
        }
    }
}