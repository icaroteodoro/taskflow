package com.icaroteodoro.taskflow.repositories;

import com.icaroteodoro.taskflow.entities.GoalLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoalLogRepository extends JpaRepository<GoalLog, UUID> {
    Optional<GoalLog> findByGoalIdAndDate(UUID goalId, LocalDate date);
}
