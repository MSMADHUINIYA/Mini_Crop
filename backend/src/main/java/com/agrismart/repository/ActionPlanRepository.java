package com.agrismart.repository;

import com.agrismart.entity.ActionPlan;
import com.agrismart.entity.Farm;
import com.agrismart.entity.ActionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActionPlanRepository extends JpaRepository<ActionPlan, Long> {
    List<ActionPlan> findAllByFarmOrderByPriorityAscDueDateAsc(Farm farm);
    List<ActionPlan> findAllByFarmAndStatusOrderByPriorityAsc(Farm farm, ActionStatus status);
    boolean existsByFarmAndTitle(Farm farm, String title);
    void deleteAllByFarm(Farm farm);
}
