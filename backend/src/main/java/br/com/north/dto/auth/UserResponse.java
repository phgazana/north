package br.com.north.dto.auth;

import br.com.north.entity.Usuario;
import java.time.OffsetDateTime;
import java.util.UUID;

public record UserResponse(UUID id, String name, String email, OffsetDateTime createdAt) {
    public static UserResponse from(Usuario user) { return new UserResponse(user.getId(), user.getNome(), user.getEmail(), user.getCreatedAt()); }
}
