package com.icaroteodoro.taskflow.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "goal_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "completed_steps", nullable = false)
    private Integer completedSteps;

    @PrePersist
    public void prePersist() {
        if (this.completedSteps == null) {
            this.completedSteps = 0;
        }
    }
}
