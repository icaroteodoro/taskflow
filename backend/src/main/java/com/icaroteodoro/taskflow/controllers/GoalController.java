package com.icaroteodoro.taskflow.controllers;

import com.icaroteodoro.taskflow.dto.goal.GoalCreateRequest;
import com.icaroteodoro.taskflow.dto.goal.GoalDTO;
import com.icaroteodoro.taskflow.dto.goal.GoalUpdateRequest;
import com.icaroteodoro.taskflow.dto.goal.LogStepRequest;
import com.icaroteodoro.taskflow.entities.User;
import com.icaroteodoro.taskflow.services.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalDTO> createGoal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GoalCreateRequest request) {
        return ResponseEntity.ok(goalService.createGoal(user.getId(), request));
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<GoalDTO> updateGoal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID goalId,
            @Valid @RequestBody GoalUpdateRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(user.getId(), goalId, request));
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID goalId) {
        goalService.deleteGoal(user.getId(), goalId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<GoalDTO>> getGoalsByDate(
            @AuthenticationPrincipal User user,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(goalService.getGoalsByDate(user.getId(), date));
    }

    @PostMapping("/{goalId}/log")
    public ResponseEntity<GoalDTO> logStep(
            @AuthenticationPrincipal User user,
            @PathVariable UUID goalId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody LogStepRequest request) {
        return ResponseEntity.ok(goalService.logStep(user.getId(), goalId, date, request));
    }
}
