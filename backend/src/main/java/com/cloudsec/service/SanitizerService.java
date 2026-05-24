package com.cloudsec.service;

import com.cloudsec.entity.CloudFile;
import com.cloudsec.repository.CloudFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

@Service
public class SanitizerService {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Autowired private CloudFileRepository fileRepo;

    private static final Map<String, Pattern> PATTERNS = new LinkedHashMap<>();
    static {
        PATTERNS.put("EMAIL",         Pattern.compile("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"));
        PATTERNS.put("PHONE",         Pattern.compile("(\\+91[\\-\\s]?)?[6-9]\\d{9}|\\(\\d{3}\\)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}"));
        PATTERNS.put("AADHAAR",       Pattern.compile("\\b\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}\\b"));
        PATTERNS.put("PAN",           Pattern.compile("\\b[A-Z]{5}[0-9]{4}[A-Z]\\b"));
        PATTERNS.put("CREDIT_CARD",   Pattern.compile("\\b(?:\\d[ \\-]?){13,16}\\b"));
        PATTERNS.put("SSN",           Pattern.compile("\\b\\d{3}[\\-]\\d{2}[\\-]\\d{4}\\b"));
        PATTERNS.put("PASSWORD_FIELD",Pattern.compile("(?i)(password|passwd|pwd)\\s*[=:]\\s*\\S+"));
        PATTERNS.put("IP_ADDRESS",    Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"));
    }

    public CloudFile sanitize(Long fileId) {
        CloudFile cf = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        try {
            String content   = Files.readString(Paths.get(cf.getFilePath()));
            String sanitized = redact(content);
            Path sanPath = Paths.get(uploadDir).toAbsolutePath().normalize()
                    .resolve("sanitized_" + cf.getFileName());
            Files.createDirectories(sanPath.getParent());
            Files.writeString(sanPath, sanitized);
            cf.setSanitizedPath(sanPath.toString());
            cf.setIsSanitized(true);
            cf.setStatus(CloudFile.FileStatus.SANITIZED);
            return fileRepo.save(cf);
        } catch (IOException e) { throw new RuntimeException("Sanitization failed: " + e.getMessage(), e); }
    }

    public Map<String, Object> preview(Long fileId) {
        CloudFile cf = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        try {
            String content = Files.readString(Paths.get(cf.getFilePath()));
            Map<String, List<String>> detected = detect(content);
            int total = detected.values().stream().mapToInt(List::size).sum();
            return Map.of("fileName", cf.getOriginalName(),
                          "detectedPatterns", detected,
                          "totalItemsToRedact", total);
        } catch (IOException e) {
            return Map.of("fileName", cf.getOriginalName(),
                          "detectedPatterns", Map.of(),
                          "totalItemsToRedact", 0,
                          "note", "File is binary or unreadable as text");
        }
    }

    private String redact(String content) {
        String s = content;
        for (var e : PATTERNS.entrySet())
            s = e.getValue().matcher(s).replaceAll("[REDACTED-" + e.getKey() + "]");
        return s;
    }

    private Map<String, List<String>> detect(String content) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (var e : PATTERNS.entrySet()) {
            Matcher m = e.getValue().matcher(content);
            List<String> found = new ArrayList<>();
            while (m.find()) {
                String v = m.group();
                found.add(v.length() <= 4 ? "****" :
                        v.substring(0, 2) + "*".repeat(Math.max(0, v.length()-4)) + v.substring(v.length()-2));
            }
            if (!found.isEmpty()) result.put(e.getKey(), found);
        }
        return result;
    }
}
