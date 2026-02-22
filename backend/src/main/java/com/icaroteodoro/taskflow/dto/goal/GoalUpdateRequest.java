package com.icaroteodoro.taskflow.dto.goal;

import com.icaroteodoro.taskflow.entities.GoalType;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GoalUpdateRequest {
    private String title;
    private GoalType type;
    
    @Min(1)
    private Integer totalSteps;
    
    private LocalDate targetDate;
}
