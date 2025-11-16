package icaroteodoro.taskflow.api.services;

import icaroteodoro.taskflow.api.dtos.tasks.ResponseTaskDTO;
import icaroteodoro.taskflow.api.dtos.tasks.TaskWithOccurrenceDTO;
import icaroteodoro.taskflow.api.models.Task;
import icaroteodoro.taskflow.api.models.TaskOccurrence;
import icaroteodoro.taskflow.api.models.User;
import icaroteodoro.taskflow.api.repositories.TaskOccurrenceRepository;
import icaroteodoro.taskflow.api.repositories.TaskRepository;
import icaroteodoro.taskflow.api.utils.enums.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskOccurrenceService occurrenceService;
    private final TaskOccurrenceRepository occurrenceRepository;
    private final UserService userService;

    // Criar nova task para um usuário
    public Task createTask(String userEmail, Task task) {

        User user = userService.getByEmail(userEmail);

        task.setUser(user);

        // opcional: impedir duplicação de nome
        if (taskRepository.existsByUserEmailAndTitle(userEmail, task.getTitle())) {
            throw new RuntimeException("The user already has a task with that name.");
        }

        return taskRepository.save(task);
    }

    // Buscar todas tasks do usuário
    public List<Task> getUserTasks(String userEmail) {
        return taskRepository.findByUserEmail(userEmail);
    }

    // Buscar *somente* as tasks do dia (diárias + pontuais)
    public List<TaskWithOccurrenceDTO> getTasksForToday(String userEmail) {
        LocalDate today = LocalDate.now();

        // Busca tarefas diárias + pontuais
        List<Task> tasks = taskRepository.findTasksForDay(userEmail, today);

        return mapTasksWithOccurrences(tasks, today);
    }

    public List<TaskWithOccurrenceDTO> getTasksByDay(String userEmail, LocalDate day) {
        // Busca tarefas diárias + pontuais
        List<Task> tasks = taskRepository.findTasksForDay(userEmail, day);

        return mapTasksWithOccurrences(tasks, day);
    }

    private List<TaskWithOccurrenceDTO> mapTasksWithOccurrences(List<Task> tasks, LocalDate day) {
        return tasks.stream()
                .map(task -> {
                    Optional<TaskOccurrence> occOpt = occurrenceService.findOccurrence(task, day);

                    return new TaskWithOccurrenceDTO(
                            task.getId(),
                            task.getTitle(),
                            task.getType(),
                            task.getDate(),
                            occOpt.map(TaskOccurrence::getId).orElse(null),
                            occOpt.map(TaskOccurrence::getStatus).orElse(TaskStatus.PENDING) // default
                    );
                })
                .collect(Collectors.toList());
    }

    public ResponseTaskDTO getTaskById(String id){
        Task task =  this.taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return new ResponseTaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getType(),
                task.getDate()
        );
    }

    // Marcar tarefa como concluída (toggla automaticamente)
    public TaskOccurrence toggleTask(String taskId, LocalDate date) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Optional<TaskOccurrence> existing = occurrenceService.findOccurrence(task, date);

        // Se existe, basta alternar o status
        if (existing.isPresent()) {
            TaskOccurrence occ = existing.get();

            if (occ.getStatus() == TaskStatus.DONE)
                occ.setStatus(TaskStatus.PENDING);
            else
                occ.setStatus(TaskStatus.DONE);

            return occurrenceRepository.save(occ);
        }

        // Se NÃO existir, criar occurrence nova marcada como concluída
        TaskOccurrence newOcc = new TaskOccurrence(
                TaskStatus.DONE,
                date,
                task
        );

        return occurrenceRepository.save(newOcc);
    }
}
