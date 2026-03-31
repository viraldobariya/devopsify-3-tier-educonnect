package com.educonnect.event.model;

import com.educonnect.event.enums.FieldType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "form_fields")
public class FormField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private RegistrationForm form;

    @Column(nullable = false)
    private String label; // e.g., "T-shirt Size"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType type;

    @Column(nullable = false)
    private Boolean required = false;

    @Column(nullable = false)
    private Boolean deleted = false;

    @Column(length = 1000)
    private String options; // For dropdown/checkbox (JSON format)

    @Column(nullable = false)
    private Integer orderIndex; // Position in form

    private String placeholder; // Optional placeholder text

    private String helpText; // Optional help text

    // Relationships
    @OneToMany(mappedBy = "field", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FormFieldResponse> fieldResponses;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        FormField formField = (FormField) o;
        return id != null && Objects.equals(id, formField.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}