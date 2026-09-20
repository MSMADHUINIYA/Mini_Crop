package com.agrismart.service;

import com.agrismart.entity.Farm;
import com.agrismart.entity.ResourceLog;
import com.agrismart.entity.ResourceType;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.ResourceLogRepository;
import org.springframework.context.annotation.Lazy;
import com.agrismart.service.ActionPlanService;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.agrismart.repository.IrrigationPlanRepository;

@Service
public class ResourceService {
    private final ResourceLogRepository resourceRepository;
    private final ActionPlanService actionPlanService;
    private final FarmRepository farmRepository;
    private final IrrigationPlanRepository irrigationPlanRepository;

    public ResourceService(ResourceLogRepository resourceRepository, FarmRepository farmRepository, @Lazy ActionPlanService actionPlanService, IrrigationPlanRepository irrigationPlanRepository) {
        this.resourceRepository = resourceRepository;
        this.farmRepository = farmRepository;
        this.actionPlanService = actionPlanService;
        this.irrigationPlanRepository = irrigationPlanRepository;
    }

    public ResourceLog addLog(Long farmId, ResourceType type, Double allocated, Double used, String note) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        ResourceLog log = new ResourceLog();
        log.setFarm(farm);
        log.setResourceType(type);
        log.setAllocated(allocated);
        log.setUsed(used);
        log.setNote(note);
        
        ResourceLog savedLog = resourceRepository.save(log);
        // Trigger automatic replanning after saving the log
        actionPlanService.verifyAndReplan(farmId);
        return savedLog;
    }

    public List<ResourceLog> getLogsForFarm(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        return resourceRepository.findAllByFarmOrderByCreatedAtDesc(farm);
    }

    public Map<String, Object> getSummary(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        
        List<ResourceLog> logs = resourceRepository.findAllByFarmOrderByCreatedAtDesc(farm);
        
        // Determine the most recent log for each resource type (logs are ordered newest first)
        Double latestWaterAllocated = null;
        Double latestWaterUsed = null;
        Double latestBudgetAllocated = null;
        Double latestBudgetUsed = null;
        Double latestLabourAllocated = null;
        Double latestLabourUsed = null;
        
        for (ResourceLog log : logs) {
            switch (log.getResourceType()) {
                case WATER:
                    if (latestWaterAllocated == null) {
                        latestWaterAllocated = log.getAllocated();
                        latestWaterUsed = log.getUsed();
                    }
                    break;
                case BUDGET:
                    if (latestBudgetAllocated == null) {
                        latestBudgetAllocated = log.getAllocated();
                        latestBudgetUsed = log.getUsed();
                    }
                    break;
                case LABOUR:
                    if (latestLabourAllocated == null) {
                        latestLabourAllocated = log.getAllocated();
                        latestLabourUsed = log.getUsed();
                    }
                    break;
            }
            // Break early if we have found the latest entry for all types
            if (latestWaterAllocated != null && latestBudgetAllocated != null && latestLabourAllocated != null) {
                break;
            }
        }
        // Default to zero when no entries exist for a type
        double totalWaterAllocated = latestWaterAllocated != null ? latestWaterAllocated : 0.0;
        double totalWaterUsed = latestWaterUsed != null ? latestWaterUsed : 0.0;
        double totalBudgetAllocated = latestBudgetAllocated != null ? latestBudgetAllocated : 0.0;
        double totalBudgetUsed = latestBudgetUsed != null ? latestBudgetUsed : 0.0;
        double totalLabourAllocated = latestLabourAllocated != null ? latestLabourAllocated : 0.0;
        double totalLabourUsed = latestLabourUsed != null ? latestLabourUsed : 0.0;
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("waterAllocated", totalWaterAllocated);
        summary.put("waterUsed", totalWaterUsed);
        // Calculate remaining water based on the latest allocation and usage only
        double adjustedRemaining = totalWaterAllocated - totalWaterUsed;
        // Ensure non-negative remaining water
        if (adjustedRemaining < 0) {
            adjustedRemaining = 0;
        }
        summary.put("waterRemaining", adjustedRemaining);
        
        summary.put("budgetAllocated", totalBudgetAllocated);
        summary.put("budgetUsed", totalBudgetUsed);
        summary.put("budgetRemaining", totalBudgetAllocated - totalBudgetUsed);
        
        summary.put("labourAllocated", totalLabourAllocated);
        summary.put("labourUsed", totalLabourUsed);
        summary.put("labourRemaining", totalLabourAllocated - totalLabourUsed);
        
        return summary;
    }
}
