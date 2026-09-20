package com.agrismart.repository;

import com.agrismart.entity.Farm;
import com.agrismart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findAllByOwner(User owner);
    Optional<Farm> findByIdAndOwner(Long id, User owner);
}
