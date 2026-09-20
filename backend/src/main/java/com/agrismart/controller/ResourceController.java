package com.agrismart.controller;

import com.agrismart.entity.ResourceLog;
import com.agrismart.entity.ResourceType;
import com.agrismart.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@PreAuthorize("isAuthenticated()")
public class ResourceController {
    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping("/farm/{farmId}")
    public ResponseEntity<ResourceLog> addLog(
            @PathVariable Long farmId,
            @RequestParam ResourceType type,
            @RequestParam Double allocated,
            @RequestParam Double used,
            @RequestParam(required = false) String note,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(resourceService.addLog(farmId, type, allocated, used, note));
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<ResourceLog>> getLogs(
            @PathVariable Long farmId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(resourceService.getLogsForFarm(farmId));
    }

    @GetMapping("/farm/{farmId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @PathVariable Long farmId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(resourceService.getSummary(farmId));
    }
}
