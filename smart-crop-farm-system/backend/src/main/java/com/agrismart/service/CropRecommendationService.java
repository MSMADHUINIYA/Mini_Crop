package com.agrismart.service;

import com.agrismart.dto.request.CropRecommendationRequest;
import com.agrismart.dto.response.CropRecommendationResponse;
import com.agrismart.dto.response.MlPredictionResponse;
import com.agrismart.entity.CropRecommendation;
import com.agrismart.entity.Farm;
import com.agrismart.repository.CropRecommendationRepository;
import com.agrismart.repository.FarmRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Produces crop recommendations by calling out to a trained ML model
 * (Random Forest, ~99.5% held-out accuracy on the standard NPK/climate
 * crop-recommendation benchmark) served by a Flask microservice.
 *
 * If the ML service is unreachable, falls back to a deterministic
 * rule-based weighted-difference scorer so the feature degrades
 * gracefully instead of failing outright.
 */
@Service
public class CropRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(CropRecommendationService.class);

    private final FarmRepository farmRepository;
    private final CropRecommendationRepository recommendationRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ml.service-url}")
    private String mlServiceUrl;

    public CropRecommendationService(FarmRepository farmRepository,
                                     CropRecommendationRepository recommendationRepository,
                                     RestTemplate restTemplate) {
        this.farmRepository = farmRepository;
        this.recommendationRepository = recommendationRepository;
        this.restTemplate = restTemplate;
    }

    public CropRecommendationResponse recommend(CropRecommendationRequest req) {
        Farm farm = farmRepository.findById(req.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        CropRecommendationResponse response;
        try {
            response = recommendViaMlService(req);
        } catch (RestClientException ex) {
            log.warn("ML service unreachable ({}); falling back to rule-based scorer.", ex.getMessage());
            response = recommendViaRuleBasedFallback(req);
        }

        saveHistory(farm, req, response);
        return response;
    }

    // ------------------------------------------------------------------
    // Primary path: trained ML model via Flask microservice
    // ------------------------------------------------------------------
    private CropRecommendationResponse recommendViaMlService(CropRecommendationRequest req) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("N", req.getNitrogen());
        payload.put("P", req.getPhosphorus());
        payload.put("K", req.getPotassium());
        payload.put("temperature", req.getTemperature());
        payload.put("humidity", req.getHumidity());
        payload.put("ph", req.getPH());
        payload.put("rainfall", req.getRainfall());

        MlPredictionResponse ml = restTemplate.postForObject(
                mlServiceUrl + "/predict", payload, MlPredictionResponse.class);

        if (ml == null || ml.getRecommendedCrop() == null) {
            throw new RestClientException("Empty response from ML service");
        }

        List<CropRecommendationResponse.CropCandidate> candidates = new ArrayList<>();
        for (MlPredictionResponse.TopCandidate c : ml.getTopCandidates()) {
            double[] profitRange = estimateProfitRange(c.getCrop(), c.getConfidence());
            candidates.add(new CropRecommendationResponse.CropCandidate(
                    capitalize(c.getCrop()),
                    c.getConfidence(),
                    c.getCrop().equals(ml.getRecommendedCrop()) ? ml.getExplanation()
                            : "Alternative candidate with " + c.getConfidence() + "% model confidence.",
                    profitRange[0],
                    profitRange[1]
            ));
        }
        candidates.sort(Comparator.comparingDouble(CropRecommendationResponse.CropCandidate::getSuitabilityScore).reversed());

        CropRecommendationResponse.CropCandidate best = candidates.get(0);
        return new CropRecommendationResponse(
                best.getCropName(),
                best.getSuitabilityScore(),
                best.getExplanation() + " [Model: " + ml.getModelUsed() + "]",
                best.getEstimatedProfitMin(),
                best.getEstimatedProfitMax(),
                candidates
        );
    }

    // ------------------------------------------------------------------
    // Fallback path: deterministic rule-based scorer (used only if the
    // ML microservice is down; documented in the paper as a resilience
    // mechanism, not the primary recommendation method).
    // ------------------------------------------------------------------
    private CropRecommendationResponse recommendViaRuleBasedFallback(CropRecommendationRequest req) {
        List<CropRecommendationResponse.CropCandidate> candidates = new ArrayList<>();
        candidates.add(evaluateCrop("Rice", 80, 40, 40, 27, 80, 5.2, 180, req));
        candidates.add(evaluateCrop("Wheat", 50, 30, 20, 18, 50, 6.2, 80, req));
        candidates.add(evaluateCrop("Maize", 60, 40, 30, 24, 65, 6.5, 110, req));
        candidates.add(evaluateCrop("Barley", 40, 25, 20, 16, 45, 7.2, 60, req));
        candidates.add(evaluateCrop("Cotton", 70, 35, 45, 28, 55, 6.0, 130, req));
        candidates.add(evaluateCrop("Sugarcane", 100, 50, 60, 30, 70, 6.8, 220, req));

        candidates.sort(Comparator.comparingDouble(CropRecommendationResponse.CropCandidate::getSuitabilityScore).reversed());
        List<CropRecommendationResponse.CropCandidate> top = candidates.subList(0, Math.min(3, candidates.size()));
        CropRecommendationResponse.CropCandidate best = top.get(0);

        return new CropRecommendationResponse(
                best.getCropName(),
                best.getSuitabilityScore(),
                best.getExplanation() + " [Fallback: rule-based scorer, ML service unavailable]",
                best.getEstimatedProfitMin(),
                best.getEstimatedProfitMax(),
                top
        );
    }

    private void saveHistory(Farm farm, CropRecommendationRequest req, CropRecommendationResponse response) {
        CropRecommendation record = new CropRecommendation();
        record.setFarm(farm);
        record.setCropName(response.getCropName());
        record.setSuitabilityScore(response.getSuitabilityScore());
        record.setExplanation(response.getExplanation());
        record.setNitrogen(req.getNitrogen());
        record.setPhosphorus(req.getPhosphorus());
        record.setPotassium(req.getPotassium());
        record.setTemperature(req.getTemperature());
        record.setHumidity(req.getHumidity());
        record.setPH(req.getPH());
        record.setRainfall(req.getRainfall());
        record.setEstimatedProfitMin(response.getEstimatedProfitMin());
        record.setEstimatedProfitMax(response.getEstimatedProfitMax());
        recommendationRepository.save(record);
    }

    public List<CropRecommendation> getRecommendationHistory(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        return recommendationRepository.findAllByFarmOrderByCreatedAtDesc(farm);
    }

    private double[] estimateProfitRange(String cropName, double confidence) {
        double baseProfitMin = 10000, baseProfitMax = 18000;
        String c = cropName.toLowerCase();
        if (c.equals("rice")) { baseProfitMin = 15000; baseProfitMax = 25000; }
        else if (c.equals("sugarcane")) { baseProfitMin = 30000; baseProfitMax = 55000; }
        else if (c.equals("maize")) { baseProfitMin = 12000; baseProfitMax = 22000; }
        else if (c.equals("wheat")) { baseProfitMin = 14000; baseProfitMax = 24000; }
        else if (c.equals("barley")) { baseProfitMin = 9000; baseProfitMax = 16000; }
        else if (c.equals("cotton")) { baseProfitMin = 20000; baseProfitMax = 35000; }
        else if (c.equals("coffee")) { baseProfitMin = 25000; baseProfitMax = 45000; }
        else if (c.equals("banana") || c.equals("grapes") || c.equals("mango") || c.equals("apple")) {
            baseProfitMin = 28000; baseProfitMax = 50000;
        }
        double multiplier = confidence / 100.0;
        return new double[]{ baseProfitMin * multiplier, baseProfitMax * multiplier };
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    // ------------------------------------------------------------------
    // Rule-based fallback scorer (unchanged from original implementation)
    // ------------------------------------------------------------------
    private CropRecommendationResponse.CropCandidate evaluateCrop(
            String cropName, double idealN, double idealP, double idealK,
            double idealTemp, double idealHumid, double idealPh, double idealRain,
            CropRecommendationRequest req) {

        double nDiff = Math.abs(req.getNitrogen() - idealN) / idealN;
        double pDiff = Math.abs(req.getPhosphorus() - idealP) / idealP;
        double kDiff = Math.abs(req.getPotassium() - idealK) / idealK;
        double tempDiff = Math.abs(req.getTemperature() - idealTemp) / idealTemp;
        double humidDiff = Math.abs(req.getHumidity() - idealHumid) / idealHumid;
        double phDiff = Math.abs(req.getPH() - idealPh) / idealPh;
        double rainDiff = Math.abs(req.getRainfall() - idealRain) / idealRain;

        double penalty = (nDiff * 0.15) + (pDiff * 0.15) + (kDiff * 0.15) +
                         (tempDiff * 0.15) + (humidDiff * 0.10) + (phDiff * 0.15) + (rainDiff * 0.15);

        double suitabilityScore = Math.max(0.0, Math.min(100.0, (1.0 - penalty) * 100.0));

        StringBuilder explanation = new StringBuilder();
        explanation.append("Recommended ").append(cropName).append(" with suitability score of ")
                .append(String.format("%.1f", suitabilityScore)).append("%. ");

        if (phDiff < 0.15) {
            explanation.append("Soil pH is in the optimal range (").append(idealPh).append("). ");
        } else if (req.getPH() < idealPh) {
            explanation.append("Soil pH (").append(req.getPH()).append(") is slightly acidic for ").append(cropName).append(". ");
        } else {
            explanation.append("Soil pH (").append(req.getPH()).append(") is slightly alkaline for ").append(cropName).append(". ");
        }

        if (nDiff < 0.25 && pDiff < 0.25 && kDiff < 0.25) {
            explanation.append("NPK nutrient levels are well-balanced. ");
        } else {
            explanation.append("Nutrient adjustments may be required (ideal NPK ")
                    .append((int) idealN).append("-").append((int) idealP).append("-").append((int) idealK).append("). ");
        }

        if (rainDiff < 0.25) {
            explanation.append("Rainfall meets water demands. ");
        } else if (req.getRainfall() < idealRain) {
            explanation.append("Water levels are low; supplemental irrigation needed. ");
        } else {
            explanation.append("High rainfall expected; ensure proper drainage. ");
        }

        double[] profit = estimateProfitRange(cropName, suitabilityScore);

        return new CropRecommendationResponse.CropCandidate(
                cropName, suitabilityScore, explanation.toString(), profit[0], profit[1]);
    }
}
