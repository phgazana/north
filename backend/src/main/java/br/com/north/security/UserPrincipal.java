package br.com.north.security;

import br.com.north.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class UserPrincipal implements UserDetails {
    private final UUID id;
    private final String nome;
    private final String email;
    private final String passwordHash;
    private final int tokenVersion;
    public UserPrincipal(UUID id, String nome, String email, String passwordHash, int tokenVersion) {
        this.id = id; this.nome = nome; this.email = email; this.passwordHash = passwordHash; this.tokenVersion = tokenVersion;
    }
    public static UserPrincipal from(Usuario user) { return new UserPrincipal(user.getId(), user.getNome(), user.getEmail(), user.getSenhaHash(), user.getTokenVersion()); }
    public UUID getId() { return id; }
    public int getTokenVersion() { return tokenVersion; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(new SimpleGrantedAuthority("ROLE_USER")); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
