package com.agrismart.dto.response;

public class IrrigationPlanResponse {
    private Long planId;
    private Double waterNeededLiters;
    private String farmName;

    public IrrigationPlanResponse() {}

    public IrrigationPlanResponse(Long planId, Double waterNeededLiters, String farmName) {
        this.planId = planId;
        this.waterNeededLiters = waterNeededLiters;
        this.farmName = farmName;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public Double getWaterNeededLiters() { return waterNeededLiters; }
    public void setWaterNeededLiters(Double waterNeededLiters) { this.waterNeededLiters = waterNeededLiters; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
}
