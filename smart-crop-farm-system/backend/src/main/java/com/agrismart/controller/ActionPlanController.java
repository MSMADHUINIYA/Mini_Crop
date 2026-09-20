package com.agrismart.controller;

import com.agrismart.entity.ActionPlan;
import com.agrismart.entity.ActionStatus;
import com.agrismart.service.ActionPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/action-plans")
@PreAuthorize("isAuthenticated()")
public class ActionPlanController {
    private final ActionPlanService actionPlanService;

    public ActionPlanController(ActionPlanService actionPlanService) {
        this.actionPlanService = actionPlanService;
    }

    @PostMapping("/farm/{farmId}")
    public ResponseEntity<ActionPlan> createPlan(
            @PathVariable Long farmId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam Integer priority,
            @RequestParam String dueDate,
            @AuthenticationPrincipal UserDetails user) {
        LocalDate parsedDate = LocalDate.parse(dueDate);
        return ResponseEntity.ok(actionPlanService.createActionPlan(farmId, title, description, priority, parsedDate));
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<ActionPlan>> getPlans(
            @PathVariable Long farmId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(actionPlanService.getPlansForFarm(farmId));
    }

    @PutMapping("/{planId}/status")
    public ResponseEntity<ActionPlan> updateStatus(
            @PathVariable Long planId,
            @RequestParam ActionStatus status,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(actionPlanService.updatePlanStatus(planId, status));
    }

    @PostMapping("/farm/{farmId}/verify-replan")
    public ResponseEntity<Map<String, Object>> verifyAndReplan(
            @PathVariable Long farmId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(actionPlanService.verifyAndReplan(farmId));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable Long planId,
            @AuthenticationPrincipal UserDetails user) {
        actionPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}
