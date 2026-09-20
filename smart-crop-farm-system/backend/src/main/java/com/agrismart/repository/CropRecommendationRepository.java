package com.agrismart.repository;

import com.agrismart.entity.CropRecommendation;
import com.agrismart.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropRecommendationRepository extends JpaRepository<CropRecommendation, Long> {
    List<CropRecommendation> findAllByFarmOrderByCreatedAtDesc(Farm farm);
    List<CropRecommendation> findTop10ByFarmOrderByCreatedAtDesc(Farm farm);
}
