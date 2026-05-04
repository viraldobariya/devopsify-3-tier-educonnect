package com.educonnect.event.repo;

import com.educonnect.event.model.FormFieldResponse;
import com.educonnect.event.model.FormResponse;
import com.educonnect.event.model.FormField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FormFieldResponseRepo extends JpaRepository<FormFieldResponse, Long> {
    Optional<FormFieldResponse> findByResponseAndField(FormResponse response, FormField field);
}
