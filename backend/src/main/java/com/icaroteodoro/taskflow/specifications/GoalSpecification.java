package com.icaroteodoro.taskflow.specifications;

import com.icaroteodoro.taskflow.entities.Goal;
import com.icaroteodoro.taskflow.entities.GoalType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.UUID;

public class GoalSpecification {

    public static Specification<Goal> byUserAndDate(UUID userId, LocalDate date) {
        return (root, query, criteriaBuilder) -> {
            var userPredicate = criteriaBuilder.equal(root.get("user").get("id"), userId);

            // type == DAILY AND (daysOfWeek is empty OR date.getDayOfWeek() in daysOfWeek)
            var typeDaily = criteriaBuilder.equal(root.get("type"), GoalType.DAILY);
            var daysOfWeekEmpty = criteriaBuilder.isEmpty(root.get("daysOfWeek"));
            var dayOfWeekContains = criteriaBuilder.isMember(date.getDayOfWeek(), root.get("daysOfWeek"));
            var dailyCondition = criteriaBuilder.and(typeDaily, criteriaBuilder.or(daysOfWeekEmpty, dayOfWeekContains));

            var typePunctual = criteriaBuilder.and(
                    criteriaBuilder.equal(root.get("type"), GoalType.PUNCTUAL),
                    criteriaBuilder.equal(root.get("targetDate"), date)
            );
            
            var datePredicate = criteriaBuilder.or(dailyCondition, typePunctual);

            return criteriaBuilder.and(userPredicate, datePredicate);
        };
    }
}
