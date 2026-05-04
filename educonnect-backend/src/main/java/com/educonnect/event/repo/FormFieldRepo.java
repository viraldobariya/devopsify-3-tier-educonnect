package com.educonnect.event.repo;

import com.educonnect.event.model.FormField;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormFieldRepo extends JpaRepository<FormField, Long> {
}
