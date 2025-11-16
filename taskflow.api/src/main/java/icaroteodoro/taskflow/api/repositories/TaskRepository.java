package icaroteodoro.taskflow.api.repositories;

import icaroteodoro.taskflow.api.models.Task;
import icaroteodoro.taskflow.api.utils.enums.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    // Todas as tarefas do usuário
    List<Task> findByUserEmail(String userEmail);

    // Tarefas do tipo DAILY do usuário
    List<Task> findByUserEmailAndType(String userEmail, TaskType type);

    // Tarefas pontuais que devem aparecer em um dia específico
    List<Task> findByUserEmailAndDate(String userEmail, LocalDate date);

    // Verificar se já existe tarefa com o mesmo nome
    boolean existsByUserEmailAndTitle(String userEmail, String title);

    // Buscar todas as tarefas de um dia
    @Query("SELECT t FROM Task t WHERE t.user.email = :userEmail  AND (t.type = 0 OR t.date = :date)")
    List<Task> findTasksForDay(@Param("userEmail") String userEmail, @Param("date") LocalDate date);
}
