package com.cloudsec.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_shares")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FileShare {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "file_id", nullable = false)
    private CloudFile file;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shared_by", nullable = false)
    private User sharedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shared_with", nullable = false)
    private User sharedWith;

    @Column(name = "use_sanitized")
    private Boolean useSanitized = true;

    @Column(name = "share_token", unique = true)
    private String shareToken;

    @Column(name = "shared_at")
    private LocalDateTime sharedAt;

    @PrePersist
    public void prePersist() { this.sharedAt = LocalDateTime.now(); }
}
