package br.com.north.service;

import br.com.north.dto.auth.*;
import br.com.north.entity.Usuario;
import br.com.north.exception.ApiException;
import br.com.north.repository.UsuarioRepository;
import br.com.north.security.JwtService;
import br.com.north.security.NorthUserDetailsService;
import br.com.north.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UsuarioRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final NorthUserDetailsService userDetailsService;
    public AuthService(UsuarioRepository users, PasswordEncoder encoder, JwtService jwt, NorthUserDetailsService userDetailsService) {
        this.users = users; this.encoder = encoder; this.jwt = jwt; this.userDetailsService = userDetailsService;
    }
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) throw ApiException.conflict("Este e-mail já possui uma conta.");
        Usuario user = new Usuario();
        user.setNome(request.name().trim()); user.setEmail(email); user.setSenhaHash(encoder.encode(request.password()));
        user = users.save(user);
        UserPrincipal principal = UserPrincipal.from(user);
        return new AuthResponse(jwt.generate(principal), "Bearer", jwt.getExpirationSeconds(), UserResponse.from(user));
    }
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        UserPrincipal user = (UserPrincipal) userDetailsService.loadUserByUsername(email);
        if (!encoder.matches(request.password(), user.getPassword())) throw ApiException.unauthorized("E-mail ou senha inválidos.");
        return new AuthResponse(jwt.generate(user), "Bearer", jwt.getExpirationSeconds(),
            users.findByEmailIgnoreCase(email).map(UserResponse::from).orElseThrow(() -> ApiException.unauthorized("E-mail ou senha inválidos.")));
    }
    private String normalizeEmail(String email) { return email.trim().toLowerCase(java.util.Locale.ROOT); }
}
