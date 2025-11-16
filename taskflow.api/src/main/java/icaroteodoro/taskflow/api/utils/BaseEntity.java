package icaroteodoro.taskflow.api.utils;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @CreatedDate
    @Column(nullable = false, updatable = false, name = "created_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime createAt;

    @LastModifiedDate
    @Column(nullable = false, updatable = false, name = "updated_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime updatedAt;
}
