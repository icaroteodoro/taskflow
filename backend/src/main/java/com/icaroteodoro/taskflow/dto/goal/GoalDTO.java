package com.icaroteodoro.taskflow.dto.goal;

import com.icaroteodoro.taskflow.entities.GoalType;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
public class GoalDTO {
    private UUID id;
    private String title;
    private GoalType type;
    private Integer totalSteps;
    private LocalDate targetDate;
    private LocalTime time;
    private Set<DayOfWeek> daysOfWeek;
    
    // Virtual fields to return alongside Goal when querying a specific date
    private Integer completedStepsToday = 0;
}
