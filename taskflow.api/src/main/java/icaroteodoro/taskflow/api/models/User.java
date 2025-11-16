package icaroteodoro.taskflow.api.models;

import icaroteodoro.taskflow.api.dtos.auth.RegisterRequestDTO;
import icaroteodoro.taskflow.api.utils.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    private String firstname;
    private String lastname;

    @Column(unique = true)
    private String email;
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();


    public User(RegisterRequestDTO body) {
        this.setFirstname(body.firstname());
        this.setLastname(body.lastname());
        this.setEmail(body.email());
        this.setPassword(body.password());
    }
}
