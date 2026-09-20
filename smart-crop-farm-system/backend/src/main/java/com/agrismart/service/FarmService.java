package com.agrismart.service;

import com.agrismart.dto.request.FarmRequest;
import com.agrismart.entity.Farm;
import com.agrismart.entity.User;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FarmService {
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    public FarmService(FarmRepository farmRepository, UserRepository userRepository) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
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

    public void deleteFarm(Long id, String userEmail) {
        Farm farm = getFarmById(id, userEmail);
        farmRepository.delete(farm);
    }
}
