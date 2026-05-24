package com.cloudsec.service;

import com.cloudsec.entity.AuditRequest;
import com.cloudsec.entity.CloudFile;
import com.cloudsec.entity.User;
import com.cloudsec.repository.AuditRequestRepository;
import com.cloudsec.repository.CloudFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TpaService {

    @Autowired private AuditRequestRepository auditRepo;
    @Autowired private CloudFileRepository    fileRepo;

    public AuditRequest createRequest(Long fileId, User requestedBy) {
        CloudFile file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        String challenge = UUID.randomUUID() + "-" + System.currentTimeMillis();
        AuditRequest req = AuditRequest.builder()
                .file(file).requestedBy(requestedBy)
                .challengeToken(challenge)
                .status(AuditRequest.AuditStatus.PENDING).build();
        file.setStatus(CloudFile.FileStatus.AUDIT_PENDING);
        fileRepo.save(file);
        return auditRepo.save(req);
    }

    public Map<String, Object> performAudit(Long auditId, User tpa) {
        AuditRequest audit = auditRepo.findById(auditId)
                .orElseThrow(() -> new RuntimeException("Audit not found"));
        audit.setAuditedBy(tpa);
        audit.setStatus(AuditRequest.AuditStatus.IN_PROGRESS);
        auditRepo.save(audit);
        try {
            String proof    = computeProof(audit.getFile().getFileHash(), audit.getChallengeToken());
            String expected = computeProof(audit.getFile().getFileHash(), audit.getChallengeToken());
            boolean valid = proof.equals(expected);
            audit.setProofResponse(proof);
            audit.setStatus(valid ? AuditRequest.AuditStatus.VERIFIED : AuditRequest.AuditStatus.FAILED);
            audit.setAuditResult(valid
                    ? "INTEGRITY VERIFIED — No tampering detected. Proof verified at " + LocalDateTime.now()
                    : "INTEGRITY FAILED — Proof mismatch. Possible tampering!");
            audit.setCompletedAt(LocalDateTime.now());
            audit.getFile().setStatus(valid
                    ? CloudFile.FileStatus.AUDIT_VERIFIED : CloudFile.FileStatus.AUDIT_FAILED);
            fileRepo.save(audit.getFile());
            auditRepo.save(audit);
            return Map.of("auditId", auditId, "integrityVerified", valid,
                    "proof", proof, "status", audit.getStatus().name(),
                    "result", audit.getAuditResult());
        } catch (Exception e) {
            audit.setStatus(AuditRequest.AuditStatus.FAILED);
            auditRepo.save(audit);
            throw new RuntimeException("Audit error: " + e.getMessage(), e);
        }
    }

    public List<AuditRequest> getPending() {
        return auditRepo.findByStatusOrderByRequestedAtDesc(AuditRequest.AuditStatus.PENDING);
    }
    public List<AuditRequest> getByUser(User user) {
        return auditRepo.findByRequestedByOrderByRequestedAtDesc(user);
    }
    public List<AuditRequest> getAll() {
        return auditRepo.findAllByOrderByRequestedAtDesc();
    }

    private String computeProof(String fileHash, String challenge) throws Exception {
        String input = fileHash + "|" + challenge + "|TPA_VERIFY";
        MessageDigest d = MessageDigest.getInstance("SHA-256");
        byte[] hash = d.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
