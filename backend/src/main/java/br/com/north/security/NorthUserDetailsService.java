package br.com.north.security;

import br.com.north.exception.ApiException;
import br.com.north.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class NorthUserDetailsService implements UserDetailsService {
    private final UsuarioRepository users;
    public NorthUserDetailsService(UsuarioRepository users) { this.users = users; }
    @Override public UserDetails loadUserByUsername(String username) {
        return users.findByEmailIgnoreCase(username.trim())
            .map(UserPrincipal::from)
            .orElseThrow(() -> ApiException.unauthorized("E-mail ou senha inválidos."));
    }
}
