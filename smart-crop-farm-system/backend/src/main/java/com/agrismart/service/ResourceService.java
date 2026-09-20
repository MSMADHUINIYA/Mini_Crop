package com.agrismart.service;

import com.agrismart.entity.Farm;
import com.agrismart.entity.ResourceLog;
import com.agrismart.entity.ResourceType;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.ResourceLogRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResourceService {
    private final ResourceLogRepository resourceRepository;
    private final FarmRepository farmRepository;

    public ResourceService(ResourceLogRepository resourceRepository, FarmRepository farmRepository) {
        this.resourceRepository = resourceRepository;
        this.farmRepository = farmRepository;
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
        
        return resourceRepository.save(log);
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
        
        double totalWaterAllocated = 0;
        double totalWaterUsed = 0;
        double totalBudgetAllocated = 0;
        double totalBudgetUsed = 0;
        double totalLabourAllocated = 0;
        double totalLabourUsed = 0;

        for (ResourceLog log : logs) {
            switch (log.getResourceType()) {
                case WATER -> {
                    totalWaterAllocated += log.getAllocated();
                    totalWaterUsed += log.getUsed();
                }
                case BUDGET -> {
                    totalBudgetAllocated += log.getAllocated();
                    totalBudgetUsed += log.getUsed();
                }
                case LABOUR -> {
                    totalLabourAllocated += log.getAllocated();
                    totalLabourUsed += log.getUsed();
                }
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("waterAllocated", totalWaterAllocated);
        summary.put("waterUsed", totalWaterUsed);
        summary.put("waterRemaining", totalWaterAllocated - totalWaterUsed);

        summary.put("budgetAllocated", totalBudgetAllocated);
        summary.put("budgetUsed", totalBudgetUsed);
        summary.put("budgetRemaining", totalBudgetAllocated - totalBudgetUsed);

        summary.put("labourAllocated", totalLabourAllocated);
        summary.put("labourUsed", totalLabourUsed);
        summary.put("labourRemaining", totalLabourAllocated - totalLabourUsed);

        return summary;
    }
}
