package com.agrismart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/farmer/test")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<String> testFarmerAccess() {
        return ResponseEntity.ok("FARMER access granted.");
    }

    @GetMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testAdminAccess() {
        return ResponseEntity.ok("ADMIN access granted.");
    }

    @GetMapping("/protected/test")
    public ResponseEntity<String> testProtectedAccess() {
        return ResponseEntity.ok("Authenticated access granted.");
    }
}
