package com.cloudsec.controller;

import com.cloudsec.entity.CloudFile;
import com.cloudsec.service.SanitizerService;
import com.cloudsec.service.CloudFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sanitizer")
public class SanitizerController {

    @Autowired private SanitizerService sanitizerService;
    @Autowired private CloudFileService fileService;

    @PostMapping("/sanitize/{fileId}")
    public ResponseEntity<Map<String,Object>> sanitize(@PathVariable Long fileId) {
        CloudFile f = sanitizerService.sanitize(fileId);
        return ResponseEntity.ok(toMap(f));
    }

    @GetMapping("/preview/{fileId}")
    public ResponseEntity<Map<String,Object>> preview(@PathVariable Long fileId) {
        return ResponseEntity.ok(sanitizerService.preview(fileId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String,Object>>> pending() {
        return ResponseEntity.ok(fileService.getUnsanitized().stream().map(this::toMap).collect(Collectors.toList()));
    }

    private Map<String,Object> toMap(CloudFile f) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id",           f.getId());
        m.put("originalName", f.getOriginalName());
        m.put("fileSize",     f.getFileSize());
        m.put("isSanitized",  f.getIsSanitized());
        m.put("status",       f.getStatus());
        m.put("ownerUsername",f.getOwner().getUsername());
        m.put("uploadedAt",   f.getUploadedAt() != null ? f.getUploadedAt().toString() : "");
        return m;
    }
}
