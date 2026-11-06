package br.com.north.service;

import br.com.north.dto.auth.UpdateProfileRequest;
import br.com.north.dto.auth.UpdatePreferencesRequest;
import br.com.north.dto.auth.UserResponse;
import br.com.north.dto.auth.ChangePasswordRequest;
import br.com.north.exception.ApiException;
import br.com.north.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class AccountService {
    private final UsuarioRepository users;
    private final PasswordEncoder passwordEncoder;
    public AccountService(UsuarioRepository users, PasswordEncoder passwordEncoder) {
        this.users = users; this.passwordEncoder = passwordEncoder;
    }
    @Transactional(readOnly = true)
    public UserResponse get(UUID id) { return UserResponse.from(users.findById(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."))); }
    @Transactional
    public UserResponse update(UUID id, UpdateProfileRequest request) {
        var user = users.findById(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        user.setNome(request.name().trim()); return UserResponse.from(users.save(user));
    }

    @Transactional
    public UserResponse updatePreferences(UUID id, UpdatePreferencesRequest request) {
        var user = users.findById(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        user.setLandingScreen(request.landingScreen());
        return UserResponse.from(users.save(user));
    }

    @Transactional
    public UserResponse completeOnboarding(UUID id) {
        var user = users.findById(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        user.setOnboardingCompleted(true);
        return UserResponse.from(users.save(user));
    }

    @Transactional
    public void changePassword(UUID id, ChangePasswordRequest request) {
        var user = users.findByIdForPasswordChange(id).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        if (!passwordEncoder.matches(request.currentPassword(), user.getSenhaHash())) {
            throw ApiException.unauthorized("A senha atual está incorreta.");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getSenhaHash())) {
            throw ApiException.badRequest("A nova senha deve ser diferente da senha atual.");
        }
        int nextTokenVersion = Math.addExact(user.getTokenVersion(), 1);
        String nextPasswordHash = passwordEncoder.encode(request.newPassword());
        user.setSenhaHash(nextPasswordHash);
        user.setTokenVersion(nextTokenVersion);
        users.save(user);
    }
}
