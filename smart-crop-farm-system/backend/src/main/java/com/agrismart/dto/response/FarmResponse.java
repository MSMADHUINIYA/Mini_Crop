package com.agrismart.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FarmResponse {
    private Long id;
    private String name;
    private String location;

    @JsonProperty("area")
    private Double sizeInAcres;

    private Double latitude;
    private Double longitude;
    private String soilType;

    public FarmResponse() {}

    public FarmResponse(Long id, String name, String location, Double sizeInAcres) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.sizeInAcres = sizeInAcres;
    }

    public FarmResponse(Long id, String name, String location, Double sizeInAcres,
                        Double latitude, Double longitude, String soilType) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.sizeInAcres = sizeInAcres;
        this.latitude = latitude;
        this.longitude = longitude;
        this.soilType = soilType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getSizeInAcres() { return sizeInAcres; }
    public void setSizeInAcres(Double sizeInAcres) { this.sizeInAcres = sizeInAcres; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }
}
