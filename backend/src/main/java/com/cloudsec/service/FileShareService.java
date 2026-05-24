package com.cloudsec.service;

import com.cloudsec.entity.*;
import com.cloudsec.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class FileShareService {

    @Autowired private FileShareRepository shareRepo;
    @Autowired private CloudFileRepository fileRepo;
    @Autowired private UserRepository userRepo;

    public FileShare share(Long fileId, User sharedBy, String sharedWithUsername, boolean useSanitized) {
        CloudFile file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        User sharedWith = userRepo.findByUsername(sharedWithUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + sharedWithUsername));
        if (useSanitized && !file.getIsSanitized())
            throw new RuntimeException("File must be sanitized before sharing with sanitized option.");
        FileShare share = FileShare.builder()
                .file(file).sharedBy(sharedBy).sharedWith(sharedWith)
                .useSanitized(useSanitized).shareToken(UUID.randomUUID().toString()).build();
        file.setIsShared(true);
        file.setStatus(CloudFile.FileStatus.SHARED);
        fileRepo.save(file);
        return shareRepo.save(share);
    }

    public List<FileShare> receivedBy(User user) { return shareRepo.findBySharedWithOrderBySharedAtDesc(user); }
    public List<FileShare> sentBy(User user)     { return shareRepo.findBySharedByOrderBySharedAtDesc(user); }
}
