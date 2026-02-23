package com.icaroteodoro.taskflow.services;

import com.icaroteodoro.taskflow.dto.goal.GoalCreateRequest;
import com.icaroteodoro.taskflow.dto.goal.GoalDTO;
import com.icaroteodoro.taskflow.dto.goal.GoalUpdateRequest;
import com.icaroteodoro.taskflow.dto.goal.LogStepRequest;
import com.icaroteodoro.taskflow.entities.Goal;
import com.icaroteodoro.taskflow.entities.GoalLog;
import com.icaroteodoro.taskflow.entities.GoalType;
import com.icaroteodoro.taskflow.entities.User;
import com.icaroteodoro.taskflow.mappers.GoalMapper;
import com.icaroteodoro.taskflow.repositories.GoalLogRepository;
import com.icaroteodoro.taskflow.repositories.GoalRepository;
import com.icaroteodoro.taskflow.repositories.UserRepository;
import com.icaroteodoro.taskflow.specifications.GoalSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalLogRepository goalLogRepository;
    private final UserRepository userRepository;
    private final GoalMapper goalMapper;

    @Transactional
    public GoalDTO createGoal(UUID userId, GoalCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getType() == GoalType.PUNCTUAL && request.getTargetDate() == null) {
            throw new IllegalArgumentException("Target date is required for PUNCTUAL goals.");
        }

        Goal goal = goalMapper.toEntity(request);
        goal.setUser(user);
        
        goal = goalRepository.save(goal);
        return goalMapper.toDto(goal);
    }

    @Transactional
    public GoalDTO updateGoal(UUID userId, UUID goalId, GoalUpdateRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this goal.");
        }

        goalMapper.updateGoalFromRequest(request, goal);
        
        if (goal.getType() == GoalType.PUNCTUAL && goal.getTargetDate() == null) {
            throw new IllegalArgumentException("Target date is required for PUNCTUAL goals.");
        }

        goal = goalRepository.save(goal);
        return goalMapper.toDto(goal);
    }

    @Transactional
    public void deleteGoal(UUID userId, UUID goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this goal.");
        }

        goalRepository.delete(goal);
    }

    @Transactional(readOnly = true)
    public List<GoalDTO> getGoalsByDate(UUID userId, LocalDate date) {
        List<Goal> goals = goalRepository.findAll(GoalSpecification.byUserAndDate(userId, date));
        
        goals.sort((g1, g2) -> {
            if (g1.getTime() == null && g2.getTime() == null) return 0;
            if (g1.getTime() == null) return 1;
            if (g2.getTime() == null) return -1;
            return g1.getTime().compareTo(g2.getTime());
        });
        
        return goals.stream().map(goal -> {
            GoalDTO dto = goalMapper.toDto(goal);
            
            // Enrich with completed steps for the requested date
            int completedSteps = goalLogRepository.findByGoalIdAndDate(goal.getId(), date)
                    .map(GoalLog::getCompletedSteps)
                    .orElse(0);
            
            dto.setCompletedStepsToday(completedSteps);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public GoalDTO logStep(UUID userId, UUID goalId, LocalDate date, LogStepRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this goal.");
        }

        GoalLog log = goalLogRepository.findByGoalIdAndDate(goalId, date)
                .orElseGet(() -> GoalLog.builder()
                        .goal(goal)
                        .date(date)
                        .completedSteps(0)
                        .build());

        int newSteps = log.getCompletedSteps() + request.getStepDelta();
        
        // Ensure constraints: 0 <= newSteps <= totalSteps
        if (newSteps < 0) {
            newSteps = 0;
        } else if (newSteps > goal.getTotalSteps()) {
            newSteps = goal.getTotalSteps();
        }

        log.setCompletedSteps(newSteps);
        goalLogRepository.save(log);

        GoalDTO dto = goalMapper.toDto(goal);
        dto.setCompletedStepsToday(log.getCompletedSteps());
        return dto;
    }
}
