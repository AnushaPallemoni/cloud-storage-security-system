package com.cloudsec;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CloudSecApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudSecApplication.class, args);
        System.out.println("╔══════════════════════════════════════════╗");
        System.out.println("║  Cloud Storage Security & Auditing System ║");
        System.out.println("║  Backend API: http://localhost:8080       ║");
        System.out.println("║  Frontend:    http://localhost:3000       ║");
        System.out.println("╚══════════════════════════════════════════╝");
    }
}
