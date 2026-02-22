package com.icaroteodoro.taskflow.dto.goal;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LogStepRequest {
    @NotNull
    private Integer stepDelta; // e.g. +1 to complete a step, -1 to revert a step
}
