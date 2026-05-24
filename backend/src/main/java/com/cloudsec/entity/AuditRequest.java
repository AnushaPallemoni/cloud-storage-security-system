package com.cloudsec.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_requests")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditRequest {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "file_id", nullable = false)
    private CloudFile file;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audited_by")
    private User auditedBy;

    @Column(name = "challenge_token", length = 256)
    private String challengeToken;

    @Column(name = "proof_response", length = 512)
    private String proofResponse;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AuditStatus status = AuditStatus.PENDING;

    @Column(name = "audit_result", length = 1000)
    private String auditResult;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() { this.requestedAt = LocalDateTime.now(); }

    public enum AuditStatus { PENDING, IN_PROGRESS, VERIFIED, FAILED }
}
