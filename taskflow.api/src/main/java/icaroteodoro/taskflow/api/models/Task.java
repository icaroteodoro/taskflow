package icaroteodoro.taskflow.api.models;


import icaroteodoro.taskflow.api.utils.BaseEntity;
import icaroteodoro.taskflow.api.utils.enums.TaskType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task extends BaseEntity {
    private String title;
    private String description;
    private TaskType type;
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "task")
    private List<TaskOccurrence> occurrences;

}