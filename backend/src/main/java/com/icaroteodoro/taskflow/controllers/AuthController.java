package com.icaroteodoro.taskflow.controllers;

import com.icaroteodoro.taskflow.dto.auth.AuthResponse;
import com.icaroteodoro.taskflow.dto.auth.ForgotPasswordRequest;
import com.icaroteodoro.taskflow.dto.auth.LoginRequest;
import com.icaroteodoro.taskflow.dto.auth.RegisterRequest;
import com.icaroteodoro.taskflow.dto.auth.ResetPasswordRequest;
import com.icaroteodoro.taskflow.dto.auth.ChangePasswordRequest;
import com.icaroteodoro.taskflow.dto.auth.TokenRefreshRequest;
import com.icaroteodoro.taskflow.dto.auth.TokenRefreshResponse;
import com.icaroteodoro.taskflow.entities.RefreshToken;
import com.icaroteodoro.taskflow.entities.User;
import com.icaroteodoro.taskflow.exceptions.TokenRefreshException;
import com.icaroteodoro.taskflow.security.JwtUtils;
import com.icaroteodoro.taskflow.services.AuthService;
import com.icaroteodoro.taskflow.services.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            authService.registerUser(signUpRequest);
            return ResponseEntity.ok("Usuário registrado com sucesso! Verifique seu e-mail.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromEmail(user.getEmail());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }
    
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        authService.verifyAccount(token);
        return ResponseEntity.ok(Map.of("message", "Conta verificada com sucesso"));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.processForgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Se a conta existir, um e-mail de redefinição de senha foi enviado."));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso"));
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso"));
    }
}
