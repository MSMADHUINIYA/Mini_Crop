package com.agrismart.service;

import com.agrismart.dto.request.IrrigationPlanRequest;
import com.agrismart.dto.response.IrrigationPlanResponse;
import com.agrismart.entity.Farm;
import com.agrismart.entity.IrrigationPlan;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.IrrigationPlanRepository;
import org.springframework.stereotype.Service;

@Service
public class IrrigationPlanService {
    private final FarmRepository farmRepository;
    private final IrrigationPlanRepository planRepository;

    public IrrigationPlanService(FarmRepository farmRepository, IrrigationPlanRepository planRepository) {
        this.farmRepository = farmRepository;
        this.planRepository = planRepository;
    }

    public IrrigationPlanResponse calculatePlan(IrrigationPlanRequest req) {
        Farm farm = farmRepository.findById(req.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        // Simple water need calculation: evapotranspiration - rainfall (mm) * conversion to liters per acre
        double deficitMm = Math.max(0, req.getEvapotranspiration() - req.getRainfall());
        // 1 mm over 1 acre ≈ 101.6 liters (1 mm = 1 liter per square meter; 1 acre = 4046.86 m2)
        double waterNeededLiters = deficitMm * 101.6 * req.getArea();
        IrrigationPlan plan = new IrrigationPlan();
        plan.setFarm(farm);
        plan.setWaterNeededLiters(waterNeededLiters);
        plan = planRepository.save(plan);
        return new IrrigationPlanResponse(plan.getId(), plan.getWaterNeededLiters(), farm.getName());
    }

    public java.util.List<IrrigationPlanResponse> getPlansForFarm(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        return planRepository.findAllByFarm(farm).stream()
                .map(p -> new IrrigationPlanResponse(p.getId(), p.getWaterNeededLiters(), farm.getName()))
                .toList();
    }
}
