package com.agrismart.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class IrrigationPlanRequest {
    @NotNull
    private Long farmId;
    @NotNull
    @PositiveOrZero
    private Double rainfall; // mm
    @NotNull
    @PositiveOrZero
    private Double evapotranspiration; // mm/day
    @NotNull
    @PositiveOrZero
    private Double area; // acres

    // Getters and Setters
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public Double getRainfall() { return rainfall; }
    public void setRainfall(Double rainfall) { this.rainfall = rainfall; }
    public Double getEvapotranspiration() { return evapotranspiration; }
    public void setEvapotranspiration(Double evapotranspiration) { this.evapotranspiration = evapotranspiration; }
    public Double getArea() { return area; }
    public void setArea(Double area) { this.area = area; }
}
