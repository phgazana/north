package br.com.north.service;

import br.com.north.dto.auth.UpdateProfileRequest;
import br.com.north.dto.auth.UserResponse;
import br.com.north.exception.ApiException;
import br.com.north.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class AccountService {
    private final UsuarioRepository users;
    public AccountService(UsuarioRepository users) { this.users = users; }
    @Transactional(readOnly = true)
    public UserResponse get(UUID id) { return UserResponse.from(users.findById(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."))); }
    @Transactional
    public UserResponse update(UUID id, UpdateProfileRequest request) {
        var user = users.findById(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        user.setNome(request.name().trim()); return UserResponse.from(users.save(user));
    }
}
