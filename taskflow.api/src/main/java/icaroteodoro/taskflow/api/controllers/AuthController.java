package icaroteodoro.taskflow.api.controllers;

import icaroteodoro.taskflow.api.dtos.auth.LoginRequestDTO;
import icaroteodoro.taskflow.api.dtos.auth.LoginResponseDTO;
import icaroteodoro.taskflow.api.dtos.auth.RegisterRequestDTO;
import icaroteodoro.taskflow.api.dtos.auth.RequestRefreshToken;
import icaroteodoro.taskflow.api.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO body) {
        return this.authService.login(body);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO body) {
        return this.authService.register(body);
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<?> createNewTokenForUser(@RequestBody RequestRefreshToken data) throws Exception {
        return this.authService.refresh(data);
    }
}