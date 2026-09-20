package com.agrismart.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class CropRecommendationRequest {
    @NotNull
    @PositiveOrZero
    private Double nitrogen;
    @NotNull
    @PositiveOrZero
    private Double phosphorus;
    @NotNull
    @PositiveOrZero
    private Double potassium;
    @NotNull
    @PositiveOrZero
    private Double temperature;
    @NotNull
    @PositiveOrZero
    private Double humidity;
    @NotNull
    @PositiveOrZero
    private Double pH;
    @NotNull
    @PositiveOrZero
    private Double rainfall;
    @NotNull
    private Long farmId;

    // Getters and Setters
    public Double getNitrogen() { return nitrogen; }
    public void setNitrogen(Double nitrogen) { this.nitrogen = nitrogen; }
    public Double getPhosphorus() { return phosphorus; }
    public void setPhosphorus(Double phosphorus) { this.phosphorus = phosphorus; }
    public Double getPotassium() { return potassium; }
    public void setPotassium(Double potassium) { this.potassium = potassium; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }
    public Double getPH() { return pH; }
    public void setPH(Double pH) { this.pH = pH; }
    public Double getRainfall() { return rainfall; }
    public void setRainfall(Double rainfall) { this.rainfall = rainfall; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
}
