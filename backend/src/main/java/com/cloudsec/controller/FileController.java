package com.cloudsec.controller;

import com.cloudsec.entity.CloudFile;
import com.cloudsec.entity.User;
import com.cloudsec.repository.UserRepository;
import com.cloudsec.service.CloudFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired private CloudFileService fileService;
    @Autowired private UserRepository   userRepo;

    @PostMapping("/upload")
    public ResponseEntity<Map<String,Object>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        CloudFile cf = fileService.upload(file, user);
        return ResponseEntity.ok(toMap(cf));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String,Object>>> myFiles(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        List<Map<String,Object>> list = fileService.getByUser(user)
                .stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String,Object>>> allFiles() {
        return ResponseEntity.ok(fileService.getAll().stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource r = fileService.loadAsResource(id, false);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + r.getFilename() + "\"")
                .body(r);
    }

    @GetMapping("/download-sanitized/{id}")
    public ResponseEntity<Resource> downloadSanitized(@PathVariable Long id) {
        Resource r = fileService.loadAsResource(id, true);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"sanitized_" + r.getFilename() + "\"")
                .body(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String,String>> delete(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        fileService.delete(id, getUser(ud));
        return ResponseEntity.ok(Map.of("message","File deleted successfully"));
    }

    private User getUser(UserDetails ud) {
        return userRepo.findByUsername(ud.getUsername()).orElseThrow();
    }

    private Map<String,Object> toMap(CloudFile f) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id",           f.getId());
        m.put("originalName", f.getOriginalName());
        m.put("fileName",     f.getFileName());
        m.put("fileSize",     f.getFileSize());
        m.put("fileType",     f.getFileType());
        m.put("fileHash",     f.getFileHash());
        m.put("isSanitized",  f.getIsSanitized());
        m.put("isShared",     f.getIsShared());
        m.put("status",       f.getStatus());
        m.put("ownerUsername",f.getOwner().getUsername());
        m.put("uploadedAt",   f.getUploadedAt() != null ? f.getUploadedAt().toString() : "");
        return m;
    }
}
