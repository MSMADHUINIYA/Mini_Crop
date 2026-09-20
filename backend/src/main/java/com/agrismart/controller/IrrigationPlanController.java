package com.agrismart.controller;

import com.agrismart.dto.request.IrrigationPlanRequest;
import com.agrismart.dto.response.IrrigationPlanResponse;
import com.agrismart.service.IrrigationPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/irrigation")
@PreAuthorize("isAuthenticated()")
public class IrrigationPlanController {
    private final IrrigationPlanService irrigationPlanService;

    public IrrigationPlanController(IrrigationPlanService irrigationPlanService) {
        this.irrigationPlanService = irrigationPlanService;
    }

    @PostMapping("/plan")
    public ResponseEntity<IrrigationPlanResponse> calculatePlan(@RequestBody IrrigationPlanRequest request,
                                                                @AuthenticationPrincipal UserDetails user) {
        // user not used now, kept for future auth checks
        IrrigationPlanResponse resp = irrigationPlanService.calculatePlan(request);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<IrrigationPlanResponse>> getPlans(@PathVariable Long farmId,
                                                                 @AuthenticationPrincipal UserDetails user) {
        List<IrrigationPlanResponse> resp = irrigationPlanService.getPlansForFarm(farmId);
        return ResponseEntity.ok(resp);
    }
}
