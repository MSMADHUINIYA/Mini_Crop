package com.agrismart.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Maps the JSON returned by the Flask /predict endpoint of the ML
 * inference microservice (see ml_service/app.py).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MlPredictionResponse {
    private String recommendedCrop;
    private double confidence;
    private String explanation;
    private String modelUsed;
    private List<TopCandidate> topCandidates;

    public String getRecommendedCrop() { return recommendedCrop; }
    public void setRecommendedCrop(String recommendedCrop) { this.recommendedCrop = recommendedCrop; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }
    public List<TopCandidate> getTopCandidates() { return topCandidates; }
    public void setTopCandidates(List<TopCandidate> topCandidates) { this.topCandidates = topCandidates; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TopCandidate {
        private String crop;
        private double confidence;

        public String getCrop() { return crop; }
        public void setCrop(String crop) { this.crop = crop; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
    }
}
