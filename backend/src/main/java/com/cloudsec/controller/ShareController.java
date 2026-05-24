package com.cloudsec.controller;

import com.cloudsec.entity.FileShare;
import com.cloudsec.entity.User;
import com.cloudsec.repository.UserRepository;
import com.cloudsec.service.FileShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/share")
public class ShareController {

    @Autowired private FileShareService shareService;
    @Autowired private UserRepository   userRepo;

    @PostMapping("/send")
    public ResponseEntity<Map<String,Object>> send(
            @RequestBody Map<String,Object> body,
            @AuthenticationPrincipal UserDetails ud) {
        Long fileId = Long.valueOf(body.get("fileId").toString());
        String withUser = body.get("sharedWithUsername").toString();
        boolean useSanitized = Boolean.parseBoolean(body.getOrDefault("useSanitized","true").toString());
        FileShare fs = shareService.share(fileId, getUser(ud), withUser, useSanitized);
        return ResponseEntity.ok(toMap(fs));
    }

    @GetMapping("/received")
    public ResponseEntity<List<Map<String,Object>>> received(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(shareService.receivedBy(getUser(ud)).stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<Map<String,Object>>> sent(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(shareService.sentBy(getUser(ud)).stream().map(this::toMap).collect(Collectors.toList()));
    }

    private User getUser(UserDetails ud) { return userRepo.findByUsername(ud.getUsername()).orElseThrow(); }

    private Map<String,Object> toMap(FileShare fs) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id",           fs.getId());
        m.put("fileId",       fs.getFile().getId());
        m.put("fileName",     fs.getFile().getOriginalName());
        m.put("sharedBy",     fs.getSharedBy().getUsername());
        m.put("sharedWith",   fs.getSharedWith().getUsername());
        m.put("useSanitized", fs.getUseSanitized());
        m.put("shareToken",   fs.getShareToken());
        m.put("sharedAt",     fs.getSharedAt() != null ? fs.getSharedAt().toString() : "");
        return m;
    }
}
