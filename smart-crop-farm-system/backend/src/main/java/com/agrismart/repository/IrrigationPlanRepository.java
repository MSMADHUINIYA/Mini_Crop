package com.agrismart.repository;

import com.agrismart.entity.IrrigationPlan;
import com.agrismart.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IrrigationPlanRepository extends JpaRepository<IrrigationPlan, Long> {
    List<IrrigationPlan> findAllByFarm(Farm farm);
}
