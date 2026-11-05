package br.com.north.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePreferencesRequest(
    @NotBlank @Pattern(regexp = "home|activities") String landingScreen
) {}
