package com.cloudsec.service;

import com.cloudsec.entity.User;
import com.cloudsec.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class PkgService {

    @Autowired private UserRepository userRepo;

    public String generateIdentityHash(String username, String email) {
        try {
            String identity = username + "|" + email + "|CLOUDSEC2024";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(identity.getBytes(StandardCharsets.UTF_8));
            return toHex(hash);
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    public String generatePublicKey(String identityHash) {
        try {
            String input = identityHash + "|PKG_MASTER_SECRET_2024";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return "IBE-PK-" + toHex(hash).toUpperCase();
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    public Map<String, String> regenerateKeys(User user) {
        String newHash = generateIdentityHash(user.getUsername() + System.currentTimeMillis(), user.getEmail());
        String newKey  = generatePublicKey(newHash);
        user.setIdentityHash(newHash);
        user.setPublicKey(newKey);
        userRepo.save(user);
        return Map.of("message","Keys regenerated","identityHash",newHash,"publicKey",newKey);
    }

    public Map<String, Object> verifyUserIdentity(String username) {
        Optional<User> opt = userRepo.findByUsername(username);
        if (opt.isEmpty()) return Map.of("verified",false,"message","User not found");
        User user = opt.get();
        String expected = generateIdentityHash(user.getUsername(), user.getEmail());
        boolean valid = expected.equals(user.getIdentityHash());
        return Map.of("username",username,"verified",valid,
                "publicKey", user.getPublicKey() != null ? user.getPublicKey() : "",
                "message", valid ? "Identity verified successfully" : "Identity mismatch");
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
