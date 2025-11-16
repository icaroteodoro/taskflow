package icaroteodoro.taskflow.api.services;


import icaroteodoro.taskflow.api.dtos.auth.*;
import icaroteodoro.taskflow.api.models.User;
import icaroteodoro.taskflow.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final TokenService tokenService;

    public ResponseEntity<?> register(RegisterRequestDTO body) {
        try{

            User newUser = this.userService.create(new User(body));
            String accessToken = this.tokenService.generateToken(newUser);
            String refreshToken = this.tokenService.generateToken(newUser);
            return ResponseEntity.ok(new RegisterResponseDTO( newUser.getFirstname(), accessToken, refreshToken));
        }catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public ResponseEntity<LoginResponseDTO> login(LoginRequestDTO body) {
        User user = this.userRepository.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("User not found"));
        if(passwordEncoder.matches(body.password(), user.getPassword())) {
            String accessToken = this.tokenService.generateToken(user);
            String refreshToken = this.tokenService.generateRefreshToken(user);
            return ResponseEntity.ok(new LoginResponseDTO(user.getFirstname(), accessToken, refreshToken));
        }
        return ResponseEntity.notFound().build();
    }

    public ResponseEntity<?> refresh(RequestRefreshToken data){
        try{
            String refresh = this.tokenService.validateToken(data.refreshToken());
            User user = this.userService.getByEmail(refresh);
            String token = this.tokenService.generateToken(user);
            String refreshToken = this.tokenService.generateRefreshToken(user);
            return ResponseEntity.ok(new LoginResponseDTO(user.getFirstname() +" "+ user.getLastname(), token, refreshToken));
        } catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}