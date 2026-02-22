package com.icaroteodoro.taskflow.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Bem-vindo ao Taskflow! Por favor, verifique seu e-mail.";
        String text = "Obrigado por se registrar no Taskflow. Por favor, clique no link abaixo para verificar sua conta:\n\n" 
                    + verificationUrl + "\n\nEste link expirará em 24 horas.";

        sendSimpleEmail(toEmail, subject, text);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Taskflow - Solicitação de Redefinição de Senha";
        String text = "Você solicitou uma redefinição de senha. Por favor, clique no link abaixo para criar uma nova senha:\n\n" 
                    + resetUrl + "\n\nEste link expirará em 1 hora. Se você não solicitou isso, por favor ignore este e-mail.";

        sendSimpleEmail(toEmail, subject, text);
    }

    private void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // Depending on strictness, we might throw an exception here or just log it
            // For now we just log to allow dev testing without real SMTP.
        }
    }
}
