package icaroteodoro.taskflow.api.controllers;

import icaroteodoro.taskflow.api.dtos.tasks.CreateTaskRequestDTO;
import icaroteodoro.taskflow.api.dtos.tasks.ResponseTaskDTO;
import icaroteodoro.taskflow.api.dtos.tasks.TaskWithOccurrenceDTO;
import icaroteodoro.taskflow.api.models.Task;
import icaroteodoro.taskflow.api.models.TaskOccurrence;
import icaroteodoro.taskflow.api.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/{taskId}")
    public ResponseEntity<ResponseTaskDTO> getTaskById(@PathVariable String taskId){
        return ResponseEntity.ok(this.taskService.getTaskById(taskId));
    }

    @PostMapping("/user/{userEmail}")
    public ResponseEntity<Task> create(@PathVariable String userEmail, @RequestBody CreateTaskRequestDTO req) {
        Task task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        task.setType(req.type());
        task.setDate(req.date());

        return ResponseEntity.ok(taskService.createTask(userEmail, task));
    }

    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<Task>> listUserTasks(@PathVariable String userEmail) {
        return ResponseEntity.ok(taskService.getUserTasks(userEmail));
    }

    @GetMapping("/user/{userEmail}/today")
    public ResponseEntity<List<TaskWithOccurrenceDTO>> getTodayTasks(@PathVariable String userEmail) {
        return ResponseEntity.ok(taskService.getTasksForToday(userEmail));
    }

    @GetMapping("/user/{userEmail}/day/{date}")
    public ResponseEntity<List<TaskWithOccurrenceDTO>> getTasksByDay(@PathVariable String userEmail, @PathVariable LocalDate date){
        System.out.println(date);
        return ResponseEntity.ok(taskService.getTasksByDay(userEmail, date));
    }

    @PutMapping("/{taskId}/toggle/{date}")
    public ResponseEntity<TaskOccurrence> toggleTask(
            @PathVariable String taskId,
            @PathVariable LocalDate date
    ) {
        return ResponseEntity.ok(taskService.toggleTask(taskId, date));
    }


}