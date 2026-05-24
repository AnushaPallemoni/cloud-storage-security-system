package com.cloudsec.service;

import com.cloudsec.entity.CloudFile;
import com.cloudsec.entity.User;
import com.cloudsec.repository.CloudFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;

@Service
public class CloudFileService {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    private final CloudFileRepository fileRepo;
    public CloudFileService(CloudFileRepository fileRepo) { this.fileRepo = fileRepo; }

    public CloudFile upload(MultipartFile file, User owner) {
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = dir.resolve(uniqueName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String hash = computeHash(target);
            CloudFile cf = CloudFile.builder()
                    .fileName(uniqueName).originalName(file.getOriginalFilename())
                    .filePath(target.toString()).fileSize(file.getSize())
                    .fileType(file.getContentType()).fileHash(hash)
                    .isSanitized(false).isShared(false)
                    .status(CloudFile.FileStatus.UPLOADED).owner(owner).build();
            return fileRepo.save(cf);
        } catch (IOException e) { throw new RuntimeException("Upload failed: " + e.getMessage(), e); }
    }

    public List<CloudFile> getByUser(User user) { return fileRepo.findByOwnerOrderByUploadedAtDesc(user); }
    public List<CloudFile> getAll() { return fileRepo.findAllByOrderByUploadedAtDesc(); }
    public CloudFile getById(Long id) {
        return fileRepo.findById(id).orElseThrow(() -> new RuntimeException("File not found: " + id));
    }
    public CloudFile save(CloudFile f) { return fileRepo.save(f); }
    public void delete(Long id, User user) {
        CloudFile f = getById(id);
        try { Files.deleteIfExists(Paths.get(f.getFilePath())); } catch (IOException ignored) {}
        if (f.getSanitizedPath() != null)
            try { Files.deleteIfExists(Paths.get(f.getSanitizedPath())); } catch (IOException ignored) {}
        fileRepo.delete(f);
    }

    public Resource loadAsResource(Long id, boolean sanitized) {
        CloudFile f = getById(id);
        String path = sanitized && f.getSanitizedPath() != null ? f.getSanitizedPath() : f.getFilePath();
        try {
            Resource r = new UrlResource(Paths.get(path).normalize().toUri());
            if (r.exists()) return r;
            throw new RuntimeException("File not found on disk");
        } catch (MalformedURLException e) { throw new RuntimeException(e); }
    }

    public List<CloudFile> getUnsanitized() { return fileRepo.findByIsSanitizedFalseOrderByUploadedAtDesc(); }

    private String computeHash(Path path) {
        try {
            MessageDigest d = MessageDigest.getInstance("SHA-256");
            byte[] bytes = Files.readAllBytes(path);
            byte[] hash  = d.digest(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) { return UUID.randomUUID().toString().replace("-",""); }
    }

    public String computeHashFromPath(String filePath) {
        return computeHash(Paths.get(filePath));
    }
}
