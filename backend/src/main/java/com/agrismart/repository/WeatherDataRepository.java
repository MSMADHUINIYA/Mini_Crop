package com.agrismart.repository;

import com.agrismart.entity.WeatherData;
import com.agrismart.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WeatherDataRepository extends JpaRepository<WeatherData, Long> {
    Optional<WeatherData> findFirstByFarmOrderByFetchedAtDesc(Farm farm);
    void deleteAllByFarm(Farm farm);
}
