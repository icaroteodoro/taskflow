package icaroteodoro.taskflow.api.services;

import icaroteodoro.taskflow.api.models.Task;
import icaroteodoro.taskflow.api.models.TaskOccurrence;
import icaroteodoro.taskflow.api.repositories.TaskOccurrenceRepository;
import icaroteodoro.taskflow.api.utils.enums.TaskStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
public class TaskOccurrenceService {

    private final TaskOccurrenceRepository occurrenceRepository;

    public TaskOccurrenceService(TaskOccurrenceRepository occurrenceRepository) {
        this.occurrenceRepository = occurrenceRepository;
    }

    /**
     * Apenas busca a occurrence do dia. Não cria.
     */
    public Optional<TaskOccurrence> findOccurrence(Task task, LocalDate date) {
        return occurrenceRepository.findByTaskIdAndDate(task.getId(), date);
    }

    /**
     * Cria uma occurrence apenas quando o usuário conclui (regra nova).
     */
    public TaskOccurrence create(Task task, LocalDate date, TaskStatus status) {
        TaskOccurrence newOccurrence = new TaskOccurrence(status, date, task);
        return occurrenceRepository.save(newOccurrence);
    }

    /**
     * Apaga uma occurrence (usado quando o usuário desmarca a task diária).
     */
    public void delete(TaskOccurrence occurrence) {
        occurrenceRepository.delete(occurrence);
    }

    // Métodos abaixo ficam opcionais (não usados pela lógica principal)

    public TaskOccurrence markAsDone(String occurrenceId) {
        TaskOccurrence occ = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new RuntimeException("Occurrence not found"));

        occ.setStatus(TaskStatus.DONE);
        return occurrenceRepository.save(occ);
    }

    public TaskOccurrence markAsPending(String occurrenceId) {
        TaskOccurrence occ = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new RuntimeException("Occurrence not found"));

        occ.setStatus(TaskStatus.PENDING);
        return occurrenceRepository.save(occ);
    }
}
