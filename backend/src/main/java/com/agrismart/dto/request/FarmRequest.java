package com.agrismart.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class FarmRequest {
    @NotBlank(message = "Farm name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Size in acres is required")
    @Positive(message = "Size must be positive")
    @JsonProperty("area")
    private Double sizeInAcres;

    private Double latitude;
    private Double longitude;
    private String soilType;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getSizeInAcres() { return sizeInAcres; }
    public void setSizeInAcres(Double sizeInAcres) { this.sizeInAcres = sizeInAcres; }

    // Deprecated alias methods removed; sizeInAcres now directly maps to 'area' via @JsonProperty


    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }
}
