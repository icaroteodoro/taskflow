package com.icaroteodoro.taskflow.mappers;

import com.icaroteodoro.taskflow.dto.goal.GoalCreateRequest;
import com.icaroteodoro.taskflow.dto.goal.GoalDTO;
import com.icaroteodoro.taskflow.dto.goal.GoalUpdateRequest;
import com.icaroteodoro.taskflow.entities.Goal;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface GoalMapper {
    GoalDTO toDto(Goal goal);
    
    Goal toEntity(GoalCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateGoalFromRequest(GoalUpdateRequest request, @MappingTarget Goal goal);
}
