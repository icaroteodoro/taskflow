package icaroteodoro.taskflow.api.repositories;

import icaroteodoro.taskflow.api.models.TaskOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskOccurrenceRepository extends JpaRepository<TaskOccurrence, String> {
    // Occurrence de uma task em um dia
    Optional<TaskOccurrence> findByTaskIdAndDate(String taskId, LocalDate date);

    // Todas occurrences da task (histórico)
    List<TaskOccurrence> findByTaskId(String taskId);

    // Todas occurrences do usuário em um dia (útil para relatórios)
    List<TaskOccurrence> findByTaskUserEmailAndDate(String userEmail, LocalDate date);
}
