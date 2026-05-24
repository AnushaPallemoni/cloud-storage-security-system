package com.cloudsec.controller;

import com.cloudsec.entity.AuditRequest;
import com.cloudsec.entity.User;
import com.cloudsec.repository.UserRepository;
import com.cloudsec.service.TpaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tpa")
public class TpaController {

    @Autowired private TpaService      tpaService;
    @Autowired private UserRepository  userRepo;

    @PostMapping("/request/{fileId}")
    public ResponseEntity<Map<String,Object>> requestAudit(
            @PathVariable Long fileId, @AuthenticationPrincipal UserDetails ud) {
        AuditRequest ar = tpaService.createRequest(fileId, getUser(ud));
        return ResponseEntity.ok(toMap(ar));
    }

    @PostMapping("/verify/{auditId}")
    public ResponseEntity<Map<String,Object>> verify(
            @PathVariable Long auditId, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(tpaService.performAudit(auditId, getUser(ud)));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String,Object>>> pending() {
        return ResponseEntity.ok(tpaService.getPending().stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<Map<String,Object>>> myRequests(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(tpaService.getByUser(getUser(ud)).stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String,Object>>> all() {
        return ResponseEntity.ok(tpaService.getAll().stream().map(this::toMap).collect(Collectors.toList()));
    }

    private User getUser(UserDetails ud) { return userRepo.findByUsername(ud.getUsername()).orElseThrow(); }

    private Map<String,Object> toMap(AuditRequest ar) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id",              ar.getId());
        m.put("fileId",          ar.getFile().getId());
        m.put("fileName",        ar.getFile().getOriginalName());
        m.put("fileHash",        ar.getFile().getFileHash());
        m.put("requestedBy",     ar.getRequestedBy().getUsername());
        m.put("auditedBy",       ar.getAuditedBy() != null ? ar.getAuditedBy().getUsername() : null);
        m.put("challengeToken",  ar.getChallengeToken());
        m.put("proofResponse",   ar.getProofResponse());
        m.put("status",          ar.getStatus());
        m.put("auditResult",     ar.getAuditResult());
        m.put("requestedAt",     ar.getRequestedAt() != null ? ar.getRequestedAt().toString() : "");
        m.put("completedAt",     ar.getCompletedAt() != null ? ar.getCompletedAt().toString() : null);
        return m;
    }
}
