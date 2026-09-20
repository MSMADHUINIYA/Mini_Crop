package com.agrismart.service;

import com.agrismart.dto.request.FarmRequest;
import com.agrismart.entity.Farm;
import com.agrismart.entity.User;
import com.agrismart.repository.ActionPlanRepository;
import com.agrismart.repository.CropRecommendationRepository;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.IrrigationPlanRepository;
import com.agrismart.repository.ResourceLogRepository;
import com.agrismart.repository.UserRepository;
import com.agrismart.repository.WeatherDataRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FarmService {
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final ActionPlanRepository actionPlanRepository;
    private final CropRecommendationRepository cropRecommendationRepository;
    private final IrrigationPlanRepository irrigationPlanRepository;
    private final ResourceLogRepository resourceLogRepository;
    private final WeatherDataRepository weatherDataRepository;

    public FarmService(FarmRepository farmRepository,
                       UserRepository userRepository,
                       ActionPlanRepository actionPlanRepository,
                       CropRecommendationRepository cropRecommendationRepository,
                       IrrigationPlanRepository irrigationPlanRepository,
                       ResourceLogRepository resourceLogRepository,
                       WeatherDataRepository weatherDataRepository) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
        this.actionPlanRepository = actionPlanRepository;
        this.cropRecommendationRepository = cropRecommendationRepository;
        this.irrigationPlanRepository = irrigationPlanRepository;
        this.resourceLogRepository = resourceLogRepository;
        this.weatherDataRepository = weatherDataRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Farm createFarm(FarmRequest request, String userEmail) {
        User owner = getUserByEmail(userEmail);
        Farm farm = new Farm();
        farm.setName(request.getName());
        farm.setLocation(request.getLocation());
        farm.setSizeInAcres(request.getSizeInAcres());
        farm.setLatitude(request.getLatitude());
        farm.setLongitude(request.getLongitude());
        farm.setSoilType(request.getSoilType());
        farm.setOwner(owner);
        return farmRepository.save(farm);
    }

    public List<Farm> getFarmsForUser(String userEmail) {
        User owner = getUserByEmail(userEmail);
        return farmRepository.findAllByOwner(owner);
    }

    public Farm getFarmById(Long id, String userEmail) {
        User owner = getUserByEmail(userEmail);
        return farmRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Farm not found or not owned by user"));
    }

    public Farm updateFarm(Long id, FarmRequest request, String userEmail) {
        Farm farm = getFarmById(id, userEmail);
        farm.setName(request.getName());
        farm.setLocation(request.getLocation());
        farm.setSizeInAcres(request.getSizeInAcres());
        farm.setLatitude(request.getLatitude());
        farm.setLongitude(request.getLongitude());
        farm.setSoilType(request.getSoilType());
        return farmRepository.save(farm);
    }

    @Transactional
    public void deleteFarm(Long id, String userEmail) {
        Farm farm = getFarmById(id, userEmail);
        // Delete all child records first to avoid FK constraint violations
        actionPlanRepository.deleteAllByFarm(farm);
        cropRecommendationRepository.deleteAllByFarm(farm);
        irrigationPlanRepository.deleteAllByFarm(farm);
        resourceLogRepository.deleteAllByFarm(farm);
        weatherDataRepository.deleteAllByFarm(farm);
        farmRepository.delete(farm);
    }
}

