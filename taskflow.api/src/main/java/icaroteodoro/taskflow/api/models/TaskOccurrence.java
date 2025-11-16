package icaroteodoro.taskflow.api.models;


import icaroteodoro.taskflow.api.utils.BaseEntity;
import icaroteodoro.taskflow.api.utils.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "task_ocurrences",uniqueConstraints = {
        @UniqueConstraint(columnNames = {"task_id", "date"})
})
public class TaskOccurrence extends BaseEntity {
    private TaskStatus status;
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;
}
