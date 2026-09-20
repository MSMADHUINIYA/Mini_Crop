package com.agrismart.controller;

import com.agrismart.dto.request.FarmRequest;
import com.agrismart.dto.response.FarmResponse;
import com.agrismart.entity.Farm;
import com.agrismart.service.FarmService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/farms")
@PreAuthorize("isAuthenticated()")
public class FarmController {
    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    private FarmResponse toResponse(Farm farm) {
        return new FarmResponse(
            farm.getId(), 
            farm.getName(), 
            farm.getLocation(), 
            farm.getSizeInAcres(),
            farm.getLatitude(),
            farm.getLongitude(),
            farm.getSoilType()
        );
    }

    @PostMapping
    public ResponseEntity<FarmResponse> createFarm(@RequestBody FarmRequest request,
                                                   @AuthenticationPrincipal UserDetails user) {
        Farm farm = farmService.createFarm(request, user.getUsername());
        return ResponseEntity.ok(toResponse(farm));
    }

    @GetMapping
    public ResponseEntity<List<FarmResponse>> getAllFarms(@AuthenticationPrincipal UserDetails user) {
        List<Farm> farms = farmService.getFarmsForUser(user.getUsername());
        List<FarmResponse> resp = farms.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmResponse> getFarm(@PathVariable Long id,
                                                 @AuthenticationPrincipal UserDetails user) {
        Farm farm = farmService.getFarmById(id, user.getUsername());
        return ResponseEntity.ok(toResponse(farm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FarmResponse> updateFarm(@PathVariable Long id,
                                                   @RequestBody FarmRequest request,
                                                   @AuthenticationPrincipal UserDetails user) {
        Farm farm = farmService.updateFarm(id, request, user.getUsername());
        return ResponseEntity.ok(toResponse(farm));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarm(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails user) {
        farmService.deleteFarm(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
