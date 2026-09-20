package com.agrismart.controller;

import com.agrismart.dto.request.CropRecommendationRequest;
import com.agrismart.dto.response.CropRecommendationResponse;
import com.agrismart.service.CropRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@PreAuthorize("isAuthenticated()")
public class CropRecommendationController {
    private final CropRecommendationService recommendationService;

    public CropRecommendationController(CropRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    public ResponseEntity<CropRecommendationResponse> recommend(@RequestBody CropRecommendationRequest request,
                                                                @AuthenticationPrincipal UserDetails user) {
        // The service currently does not need the user, but we keep the param for future auth checks
        CropRecommendationResponse resp = recommendationService.recommend(request);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<com.agrismart.entity.CropRecommendation>> getHistory(@PathVariable Long farmId,
                                                                                   @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(recommendationService.getRecommendationHistory(farmId));
    }
}
