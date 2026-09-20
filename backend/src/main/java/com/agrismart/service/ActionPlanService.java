package com.agrismart.service;

import com.agrismart.entity.ActionPlan;
import com.agrismart.entity.ActionStatus;
import com.agrismart.entity.Farm;
import com.agrismart.repository.ActionPlanRepository;
import com.agrismart.repository.FarmRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import com.agrismart.entity.IrrigationPlan;
import com.agrismart.repository.IrrigationPlanRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActionPlanService {
    private final ActionPlanRepository actionPlanRepository;
    private final FarmRepository farmRepository;
    private final ResourceService resourceService;
    private final IrrigationPlanRepository irrigationPlanRepository;

    public ActionPlanService(ActionPlanRepository actionPlanRepository,
                             FarmRepository farmRepository,
                             ResourceService resourceService,
                             IrrigationPlanRepository irrigationPlanRepository) {
        this.actionPlanRepository = actionPlanRepository;
        this.farmRepository = farmRepository;
        this.resourceService = resourceService;
        this.irrigationPlanRepository = irrigationPlanRepository;
    }

    public ActionPlan createActionPlan(Long farmId, String title, String description, Integer priority, LocalDate dueDate) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        ActionPlan plan = new ActionPlan();
        plan.setFarm(farm);
        plan.setTitle(title);
        plan.setDescription(description);
        plan.setPriority(priority);
        plan.setDueDate(dueDate);
        plan.setStatus(ActionStatus.PENDING);
        
        return actionPlanRepository.save(plan);
    }

    public List<ActionPlan> getPlansForFarm(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        return actionPlanRepository.findAllByFarmOrderByPriorityAscDueDateAsc(farm);
    }

    public ActionPlan updatePlanStatus(Long planId, ActionStatus status) {
        ActionPlan plan = actionPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Action plan not found"));
        plan.setStatus(status);
        return actionPlanRepository.save(plan);
    }

    public void deletePlan(Long planId) {
        actionPlanRepository.deleteById(planId);
    }

    @Transactional
    public Map<String, Object> verifyAndReplan(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        Map<String, Object> summary = resourceService.getSummary(farmId);
        
        double waterUsed = (Double) summary.get("waterUsed");
        double waterAllocated = (Double) summary.get("waterAllocated");
        double budgetUsed = (Double) summary.get("budgetUsed");
        double budgetAllocated = (Double) summary.get("budgetAllocated");
        
        // Water remaining is based on current allocation and usage only
        double adjustedRemaining = waterAllocated - waterUsed;
        // Ensure non-negative remaining water
        if (adjustedRemaining < 0) {
            adjustedRemaining = 0;
        }
        summary.put("waterRemaining", adjustedRemaining);

        boolean replanNeeded = false;
        StringBuilder message = new StringBuilder("Resource verification checked. ");

        // Check if there is over-utilization
        if (waterAllocated > 0 && (waterUsed / waterAllocated) > 1.1) {
            replanNeeded = true;
            message.append("Water utilization exceeds allocation by more than 10%. ");
        }
        if (budgetAllocated > 0 && (budgetUsed / budgetAllocated) > 1.1) {
            replanNeeded = true;
            message.append("Budget utilization exceeds allocation by more than 10%. ");
        }

        if (replanNeeded) {
            // Mark existing pending plans as REPLANNED
            List<ActionPlan> pendingPlans = actionPlanRepository.findAllByFarmAndStatusOrderByPriorityAsc(farm, ActionStatus.PENDING);
            for (ActionPlan plan : pendingPlans) {
                plan.setStatus(ActionStatus.REPLANNED);
                actionPlanRepository.save(plan);
            }

// Adaptive water replanning: adjust irrigation plan values
            List<IrrigationPlan> irrigationPlans = irrigationPlanRepository.findAllByFarm(farm);
            if (!irrigationPlans.isEmpty()) {
                IrrigationPlan ip = irrigationPlans.get(0);
                // Calculate extra water used beyond allocation
                double extraUsed = waterUsed - waterAllocated;
                double adjusted = ip.getOriginalWaterNeededLiters();
                if (extraUsed > 0) {
                    adjusted += extraUsed; // increase future requirement by the overused amount
                }
                ip.setAdjustedWaterNeededLiters(adjusted);
                ip.setReplanned(true);
                irrigationPlanRepository.save(ip);
            }

            // Create new corrective action items
            if (waterAllocated > 0 && (waterUsed / waterAllocated) > 1.1) {
                // Duplicate-action guard: avoid creating same corrective actions multiple times
                if (!actionPlanRepository.existsByFarmAndTitle(farm, "Optimize Drip Irrigation Scheduler")) {
                    createActionPlan(farmId, "Optimize Drip Irrigation Scheduler",
                            "Adjust irrigation timing to night hours to reduce evaporation and lower water usage.",
                            1, LocalDate.now().plusDays(2));
                }
                if (!actionPlanRepository.existsByFarmAndTitle(farm, "Implement Mulching on Crop Beds")) {
                    createActionPlan(farmId, "Implement Mulching on Crop Beds",
                            "Apply crop residues or plastic mulch to conserve soil moisture.",
                            2, LocalDate.now().plusDays(5));
                }
            }
            if (budgetAllocated > 0 && (budgetUsed / budgetAllocated) > 1.1) {
                if (!actionPlanRepository.existsByFarmAndTitle(farm, "Renegotiate Fertilizer/Seed Supply Contracts")) {
                    createActionPlan(farmId, "Renegotiate Fertilizer/Seed Supply Contracts",
                            "Seek bulk discounts or alternative suppliers to lower material costs.",
                            1, LocalDate.now().plusDays(3));
                }
            }

            message.append("Replanning triggered successfully! Pre-existing pending items marked as REPLANNED, and corrective actions created.");
        } else {
            message.append("Resource usage is within safe limits. No replanning needed.");
        }

        return Map.of(
            "replanNeeded", replanNeeded,
            "message", message.toString(),
            "summary", summary
        );
    }
}
