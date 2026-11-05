package br.com.north.dto.auth;

public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds, UserResponse user) {}
