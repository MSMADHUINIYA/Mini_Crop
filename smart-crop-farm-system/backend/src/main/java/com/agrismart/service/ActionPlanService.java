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

@Service
public class ActionPlanService {
    private final ActionPlanRepository actionPlanRepository;
    private final FarmRepository farmRepository;
    private final ResourceService resourceService;

    public ActionPlanService(ActionPlanRepository actionPlanRepository, 
                             FarmRepository farmRepository,
                             ResourceService resourceService) {
        this.actionPlanRepository = actionPlanRepository;
        this.farmRepository = farmRepository;
        this.resourceService = resourceService;
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

    public Map<String, Object> verifyAndReplan(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        Map<String, Object> summary = resourceService.getSummary(farmId);
        
        double waterUsed = (Double) summary.get("waterUsed");
        double waterAllocated = (Double) summary.get("waterAllocated");
        double budgetUsed = (Double) summary.get("budgetUsed");
        double budgetAllocated = (Double) summary.get("budgetAllocated");

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

            // Create new corrective action items
            if (waterAllocated > 0 && (waterUsed / waterAllocated) > 1.1) {
                createActionPlan(farmId, "Optimize Drip Irrigation Scheduler", 
                        "Adjust irrigation timing to night hours to reduce evaporation and lower water usage.", 
                        1, LocalDate.now().plusDays(2));
                createActionPlan(farmId, "Implement Mulching on Crop Beds", 
                        "Apply crop residues or plastic mulch to conserve soil moisture.", 
                        2, LocalDate.now().plusDays(5));
            }
            if (budgetAllocated > 0 && (budgetUsed / budgetAllocated) > 1.1) {
                createActionPlan(farmId, "Renegotiate Fertilizer/Seed Supply Contracts", 
                        "Seek bulk discounts or alternative suppliers to lower material costs.", 
                        1, LocalDate.now().plusDays(3));
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
