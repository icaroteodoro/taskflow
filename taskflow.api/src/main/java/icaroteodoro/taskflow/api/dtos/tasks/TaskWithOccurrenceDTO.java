package icaroteodoro.taskflow.api.dtos.tasks;

import icaroteodoro.taskflow.api.utils.enums.TaskStatus;
import icaroteodoro.taskflow.api.utils.enums.TaskType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskWithOccurrenceDTO(
        String taskId,
        String title,
        TaskType type,
        LocalDate date,
        String occurrenceId,
        TaskStatus status) {
}
