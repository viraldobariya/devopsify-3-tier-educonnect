package com.educonnect.user.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    private String fullName;

    @Column(unique = true)
    private String username;


    @Column(unique = true)
    @Email
    private String email;

    @Enumerated(EnumType.STRING)
    private University university;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "users_skill",
            joinColumns = {
                    @JoinColumn(name = "user_id", referencedColumnName = "id")
            }
    )
    @Column(name = "skill")
    @Enumerated(EnumType.STRING)
    private Set<Skill> skills;

    @Enumerated(EnumType.STRING)
    private Course course;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String bio;

    private String linkedin;

    private String github;

    private String password;

    private String avatar;

    private Date createdAt;

    private Date updatedAt;

    @PrePersist
    protected void onCreate(){
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }


    @PreUpdate
    protected void onUpdate(){
        this.updatedAt = new Date();
    }

    public enum University {

        GUJARAT_UNIVERSITY,
        SARDAR_PATEL_UNIVERSITY,
        MAHARAJA_SAYAJIRAO_UNIVERSITY,
        NIRMA_UNIVERSITY,
        DDIT_UNIVERSITY,
        GANPAT_UNIVERSITY,
        PARUL_UNIVERSITY,
        MARWADI_UNIVERSITY,
        CHARUSAT_UNIVERSITY,
        PANDIT_DINDAYAL_ENERGY_UNIVERSITY,
        GUJARAT_TECHNOLOGICAL_UNIVERSITY,
        SWARNIM_GUJARAT_TECHNOLOGICAL_UNIVERSITY,
        KADI_SARVA_VISHWAVIDYALAYA,
        RAI_UNIVERSITY,
        INDIRA_GANDHI_OPEN_UNIVERSITY_GUJARAT,
        GLS_UNIVERSITY,
        VEER_NARMAD_SOUTH_GUJARAT_UNIVERSITY,
        HEMCHANDRACHARYA_NORTH_GUJARAT_UNIVERSITY,
        KRANTIGURU_SHYAMJI_KRISHNA_VERMA_KACHCHH_UNIVERSITY

    }

    public enum Skill {

        // === 🔧 Programming Languages ===
        JAVA,
        PYTHON,
        JAVASCRIPT,
        TYPESCRIPT,
        C,
        CPP, // C++
        CSHARP,
        GO,
        RUST,
        SWIFT,
        KOTLIN,
        PHP,
        RUBY,
        DART,
        SQL,
        R,
        MATLAB,

        // === 🖥️ Web & App Development ===
        HTML,
        CSS,
        SCSS,
        REACT,
        ANGULAR,
        VUE,
        NEXTJS,
        SPRING_BOOT,
        FLASK,
        DJANGO,
        NODEJS,
        EXPRESS,
        TAILWIND,
        BOOTSTRAP,
        WORDPRESS,

        // === 📱 Mobile Development ===
        FLUTTER,
        REACT_NATIVE,
        ANDROID,
        IOS,

        // === 🔗 APIs & Communication ===
        REST_API,
        GRAPHQL,
        SOCKETIO,
        WEBRTC,

        // === ☁️ DevOps & Cloud ===
        GIT,
        GITHUB,
        GITLAB,
        DOCKER,
        KUBERNETES,
        AWS,
        AZURE,
        GCP,
        JENKINS,
        HEROKU,
        NETLIFY,
        VERCEL,

        // === 🧪 Testing & QA ===
        JUNIT,
        SELENIUM,
        CYPRESS,
        JEST,
        POSTMAN,

        // === 🧠 AI / ML / Data Science ===
        TENSORFLOW,
        PYTORCH,
        SCIKIT_LEARN,
        NUMPY,
        PANDAS,
        MATPLOTLIB,
        LANGCHAIN,
        OPENAI_API,
        POWERBI,
        TABLEAU,
        EXCEL,
        DATA_ANALYSIS,
        MACHINE_LEARNING,
        DEEP_LEARNING,
        STATISTICS,

        // === 🎨 Design & Creative ===
        PHOTOSHOP,
        FIGMA,
        ADOBE_XD,
        ILLUSTRATOR,
        PREMIERE_PRO,
        AFTER_EFFECTS,
        UI_UX_DESIGN,
        VIDEO_EDITING,
        GRAPHIC_DESIGN,
        _3D_MODELING,
        BLENDER,
        CANVA,

        // === 📊 Business & Finance ===
        FINANCIAL_MODELING,
        ACCOUNTING,
        MARKETING,
        DIGITAL_MARKETING,
        SEO,
        CONTENT_WRITING,
        COPYWRITING,
        MANAGEMENT,
        ENTREPRENEURSHIP,
        BUSINESS_ANALYSIS,

        // === 🧪 Engineering / Core Fields ===
        AUTOCAD,
        SOLIDWORKS,
        ANSYS,
        PLC,
        ROBOTICS,
        IOT,
        ELECTRONICS,
        CAD,
        CIVIL_ENGINEERING,
        MECHANICAL_ENGINEERING,
        ELECTRICAL_ENGINEERING,
        THERMODYNAMICS,
        STRUCTURAL_ANALYSIS,

        // === 🌍 Communication & Languages ===
        ENGLISH,
        HINDI,
        GUJARATI,
        JAPANESE,
        FRENCH,
        GERMAN,
        PUBLIC_SPEAKING,
        DEBATING,
        TRANSLATION,

        // === 🧠 Soft Skills ===
        LEADERSHIP,
        TEAMWORK,
        TIME_MANAGEMENT,
        CRITICAL_THINKING,
        PROBLEM_SOLVING,
        PROJECT_MANAGEMENT,
        ORGANIZATION,

        // === 📚 Education / Research ===
        TEACHING,
        RESEARCH,
        WRITING,
        JOURNALISM,
        DATA_COLLECTION,
        SURVEY_DESIGN,

        // === 🎯 Others ===
        EVENT_MANAGEMENT,
        VOLUNTEERING,
        SOCIAL_MEDIA_MANAGEMENT,
        PHOTOGRAPHY,
        BLOGGING,
        PRESENTATION_SKILLS,
        RESUME_WRITING,
        INTERVIEW_PREPARATION

    }

    public enum Course {

        // === 🛠️ Engineering Degrees (UG + PG) ===
        COMPUTER_ENGINEERING,
        INFORMATION_TECHNOLOGY,
        ELECTRICAL_ENGINEERING,
        ELECTRONICS_COMMUNICATION_ENGINEERING,
        MECHANICAL_ENGINEERING,
        CIVIL_ENGINEERING,
        CHEMICAL_ENGINEERING,
        AUTOMOBILE_ENGINEERING,
        MECHATRONICS_ENGINEERING,
        BIOMEDICAL_ENGINEERING,
        AERONAUTICAL_ENGINEERING,
        AGRICULTURAL_ENGINEERING,
        MARINE_ENGINEERING,
        MINING_ENGINEERING,
        INDUSTRIAL_ENGINEERING,
        TEXTILE_ENGINEERING,
        PETROLEUM_ENGINEERING,
        ENVIRONMENTAL_ENGINEERING,
        STRUCTURAL_ENGINEERING,
        ROBOTICS_ENGINEERING,

        // === 🎓 Popular Non-Engineering Courses (Top 20) ===
        BCA,
        MCA,
        BSC_IT,
        MSC_IT,
        BBA,
        MBA,
        BCOM,
        MCOM,
        BA,
        MA,
        BSC,
        MSC,
        BPHARMA,
        MPHARMA,
        MBBS,
        LLB,
        LLM,
        BARCH,
        BDES,
        BFA

    }

    public enum Role {

        ADMIN,
        USER

    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Users users = (Users) o;
        return id != null && id.equals(users.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}
