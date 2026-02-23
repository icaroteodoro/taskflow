package com.icaroteodoro.taskflow.dto.goal;

import com.icaroteodoro.taskflow.entities.GoalType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
public class GoalCreateRequest {
    @NotBlank
    private String title;

    @NotNull
    private GoalType type;

    @NotNull
    @Min(1)
    private Integer totalSteps;

    // Optional depending on GoalType
    private LocalDate targetDate;

    private LocalTime time;

    private Set<DayOfWeek> daysOfWeek;
}
