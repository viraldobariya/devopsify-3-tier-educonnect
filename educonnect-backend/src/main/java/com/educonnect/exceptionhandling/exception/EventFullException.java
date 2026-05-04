package com.educonnect.exceptionhandling.exception;

public class EventFullException extends Throwable {
    public EventFullException(String eventHasReachedMaximumCapacity) {
        super(eventHasReachedMaximumCapacity);
    }
}
