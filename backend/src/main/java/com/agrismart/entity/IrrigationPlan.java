package com.agrismart.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "irrigation_plan")
public class IrrigationPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false)
    private Double waterNeededLiters;

    // New fields for adaptive replanning
    @Column(nullable = true)
    private Double originalWaterNeededLiters;

    @Column(nullable = true)
    private Double adjustedWaterNeededLiters;

    @Column(nullable = false)
    private Boolean replanned = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { 
        this.createdAt = LocalDateTime.now();
        if (this.originalWaterNeededLiters == null) {
            this.originalWaterNeededLiters = this.waterNeededLiters;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }
    public Double getWaterNeededLiters() { return waterNeededLiters; }
    public void setWaterNeededLiters(Double waterNeededLiters) { this.waterNeededLiters = waterNeededLiters; }

    public Double getOriginalWaterNeededLiters() { return originalWaterNeededLiters; }
    public void setOriginalWaterNeededLiters(Double originalWaterNeededLiters) { this.originalWaterNeededLiters = originalWaterNeededLiters; }

    public Double getAdjustedWaterNeededLiters() { return adjustedWaterNeededLiters; }
    public void setAdjustedWaterNeededLiters(Double adjustedWaterNeededLiters) { this.adjustedWaterNeededLiters = adjustedWaterNeededLiters; }

    public Boolean getReplanned() { return replanned; }
    public void setReplanned(Boolean replanned) { this.replanned = replanned; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
