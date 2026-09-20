package com.agrismart.repository;

import com.agrismart.entity.ResourceLog;
import com.agrismart.entity.Farm;
import com.agrismart.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceLogRepository extends JpaRepository<ResourceLog, Long> {
    List<ResourceLog> findAllByFarmOrderByCreatedAtDesc(Farm farm);
    List<ResourceLog> findAllByFarmAndResourceTypeOrderByCreatedAtDesc(Farm farm, ResourceType type);
    void deleteAllByFarm(Farm farm);
}
