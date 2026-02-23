package com.icaroteodoro.taskflow.dto.goal;

import com.icaroteodoro.taskflow.entities.GoalType;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
public class GoalUpdateRequest {
    private String title;
    private GoalType type;
    
    @Min(1)
    private Integer totalSteps;
    
    private LocalDate targetDate;
    
    private LocalTime time;
    
    private Set<DayOfWeek> daysOfWeek;
}
