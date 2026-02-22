package com.icaroteodoro.taskflow.services;

import com.icaroteodoro.taskflow.dto.auth.AuthResponse;
import com.icaroteodoro.taskflow.dto.auth.LoginRequest;
import com.icaroteodoro.taskflow.dto.auth.RegisterRequest;
import com.icaroteodoro.taskflow.entities.RefreshToken;
import com.icaroteodoro.taskflow.entities.User;
import com.icaroteodoro.taskflow.entities.VerificationToken;
import com.icaroteodoro.taskflow.entities.PasswordResetToken;
import com.icaroteodoro.taskflow.repositories.UserRepository;
import com.icaroteodoro.taskflow.repositories.VerificationTokenRepository;
import com.icaroteodoro.taskflow.repositories.PasswordResetTokenRepository;
import com.icaroteodoro.taskflow.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    
    @Autowired
    private VerificationTokenRepository verificationTokenRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private EmailService emailService;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User userDetails = (User) authentication.getPrincipal();

        // Delete existing refresh tokens and create a new one
        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId().toString())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public void registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setName(registerRequest.getName());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEnabled(false); // Require email verification

        userRepository.save(user);
        
        // Generate Token and Send Email
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, user, LocalDateTime.now().plusHours(24));
        verificationTokenRepository.save(verificationToken);
        
        emailService.sendVerificationEmail(user.getEmail(), token);
    }
    
    @Transactional
    public void verifyAccount(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
            
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }
        
        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        
        verificationTokenRepository.delete(verificationToken);
    }
    
    @Transactional
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("No account found with that email"));
            
        // Delete any existing tokens
        passwordResetTokenRepository.deleteByUserId(user.getId());
        
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);
        
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
            
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }
        
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        passwordResetTokenRepository.delete(resetToken);
    }
    
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
