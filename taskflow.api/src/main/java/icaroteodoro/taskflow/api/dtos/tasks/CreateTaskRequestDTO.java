package icaroteodoro.taskflow.api.dtos.tasks;

import icaroteodoro.taskflow.api.utils.enums.TaskType;

import java.time.LocalDate;

public record CreateTaskRequestDTO(
        String title,
        String description,
        TaskType type,
        LocalDate date
) {}