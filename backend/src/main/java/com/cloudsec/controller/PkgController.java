package com.cloudsec.controller;

import com.cloudsec.entity.User;
import com.cloudsec.repository.UserRepository;
import com.cloudsec.service.PkgService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/pkg")
public class PkgController {

    @Autowired private PkgService     pkgService;
    @Autowired private UserRepository userRepo;

    @GetMapping("/my-key")
    public ResponseEntity<Map<String,Object>> myKey(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(Map.of(
                "username",     user.getUsername(),
                "email",        user.getEmail(),
                "identityHash", user.getIdentityHash() != null ? user.getIdentityHash() : "",
                "publicKey",    user.getPublicKey()    != null ? user.getPublicKey()    : ""
        ));
    }

    @PostMapping("/regenerate-key")
    public ResponseEntity<Map<String,String>> regenerate(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(pkgService.regenerateKeys(getUser(ud)));
    }

    @GetMapping("/verify/{username}")
    public ResponseEntity<Map<String,Object>> verify(@PathVariable String username) {
        return ResponseEntity.ok(pkgService.verifyUserIdentity(username));
    }

    private User getUser(UserDetails ud) { return userRepo.findByUsername(ud.getUsername()).orElseThrow(); }
}
