package icaroteodoro.taskflow.api.dtos.auth;

public record LoginResponseDTO(String firstname, String accessToken, String refreshToken) {
}
