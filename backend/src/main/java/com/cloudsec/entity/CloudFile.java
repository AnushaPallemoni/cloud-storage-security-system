package com.cloudsec.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cloud_files")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CloudFile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_hash", length = 64)
    private String fileHash;

    @Column(name = "sanitized_path")
    private String sanitizedPath;

    @Column(name = "is_sanitized")
    private Boolean isSanitized = false;

    @Column(name = "is_shared")
    private Boolean isShared = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FileStatus status = FileStatus.UPLOADED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() { this.uploadedAt = LocalDateTime.now(); }

    public enum FileStatus {
        UPLOADED, SANITIZED, AUDIT_PENDING, AUDIT_VERIFIED, AUDIT_FAILED, SHARED
    }
}
