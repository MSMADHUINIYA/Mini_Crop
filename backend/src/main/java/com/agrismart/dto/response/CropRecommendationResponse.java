package com.agrismart.dto.response;

import java.util.List;

public class CropRecommendationResponse {
    private String cropName;
    private double suitabilityScore;
    private String explanation;
    private double estimatedProfitMin;
    private double estimatedProfitMax;
    private List<CropCandidate> candidates;

    public CropRecommendationResponse() {}

    public CropRecommendationResponse(String cropName, double suitabilityScore, String explanation, 
                                      double estimatedProfitMin, double estimatedProfitMax, 
                                      List<CropCandidate> candidates) {
        this.cropName = cropName;
        this.suitabilityScore = suitabilityScore;
        this.explanation = explanation;
        this.estimatedProfitMin = estimatedProfitMin;
        this.estimatedProfitMax = estimatedProfitMax;
        this.candidates = candidates;
    }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }
    public double getSuitabilityScore() { return suitabilityScore; }
    public void setSuitabilityScore(double suitabilityScore) { this.suitabilityScore = suitabilityScore; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public double getEstimatedProfitMin() { return estimatedProfitMin; }
    public void setEstimatedProfitMin(double estimatedProfitMin) { this.estimatedProfitMin = estimatedProfitMin; }
    public double getEstimatedProfitMax() { return estimatedProfitMax; }
    public void setEstimatedProfitMax(double estimatedProfitMax) { this.estimatedProfitMax = estimatedProfitMax; }
    public List<CropCandidate> getCandidates() { return candidates; }
    public void setCandidates(List<CropCandidate> candidates) { this.candidates = candidates; }

    public static class CropCandidate {
        private String cropName;
        private double suitabilityScore;
        private String explanation;
        private double estimatedProfitMin;
        private double estimatedProfitMax;

        public CropCandidate() {}

        public CropCandidate(String cropName, double suitabilityScore, String explanation, 
                             double estimatedProfitMin, double estimatedProfitMax) {
            this.cropName = cropName;
            this.suitabilityScore = suitabilityScore;
            this.explanation = explanation;
            this.estimatedProfitMin = estimatedProfitMin;
            this.estimatedProfitMax = estimatedProfitMax;
        }

        public String getCropName() { return cropName; }
        public void setCropName(String cropName) { this.cropName = cropName; }
        public double getSuitabilityScore() { return suitabilityScore; }
        public void setSuitabilityScore(double suitabilityScore) { this.suitabilityScore = suitabilityScore; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public double getEstimatedProfitMin() { return estimatedProfitMin; }
        public void setEstimatedProfitMin(double estimatedProfitMin) { this.estimatedProfitMin = estimatedProfitMin; }
        public double getEstimatedProfitMax() { return estimatedProfitMax; }
        public void setEstimatedProfitMax(double estimatedProfitMax) { this.estimatedProfitMax = estimatedProfitMax; }
    }
}
