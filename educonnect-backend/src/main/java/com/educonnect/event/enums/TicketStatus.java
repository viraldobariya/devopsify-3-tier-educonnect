package com.educonnect.event.enums;

public enum TicketStatus {
    PENDING,        // Ticket created but form not submitted
    ACTIVE,         // Ticket is valid and can be used
    USED,           // Ticket has been used for event entry
    CANCELLED,      // Ticket cancelled due to registration cancellation
    EXPIRED         // Ticket expired (after event end date)
}
