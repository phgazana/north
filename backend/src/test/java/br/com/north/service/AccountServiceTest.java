package br.com.north.service;

import br.com.north.dto.auth.UpdatePreferencesRequest;
import br.com.north.dto.auth.ChangePasswordRequest;
import br.com.north.entity.Usuario;
import br.com.north.exception.ApiException;
import br.com.north.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    @Mock UsuarioRepository users;
    @Mock PasswordEncoder passwordEncoder;
    private AccountService service;

    @BeforeEach void setUp() { service = new AccountService(users, passwordEncoder); }

    @Test void updatesPreferencesOnlyForTheAuthenticatedUserId() {
        UUID userId = UUID.randomUUID();
        Usuario user = user(userId);
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(users.save(user)).thenReturn(user);

        var response = service.updatePreferences(userId, new UpdatePreferencesRequest("activities"));

        assertEquals("activities", response.landingScreen());
        verify(users).findById(userId);
    }

    @Test void completesOnboardingAndReturnsPersistedState() {
        UUID userId = UUID.randomUUID();
        Usuario user = user(userId);
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(users.save(user)).thenReturn(user);

        var response = service.completeOnboarding(userId);

        assertEquals(true, response.onboardingCompleted());
        verify(users).findById(userId);
    }

    @Test void doesNotAllowUpdatingAUserThatDoesNotExist() {
        UUID userId = UUID.randomUUID();
        when(users.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ApiException.class,
            () -> service.updatePreferences(userId, new UpdatePreferencesRequest("home")));
    }

    @Test void changesPasswordAndIncrementsTokenVersion() {
        UUID userId = UUID.randomUUID();
        Usuario user = user(userId);
        user.setSenhaHash("old-hash");
        when(users.findByIdForPasswordChange(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        service.changePassword(userId, new ChangePasswordRequest("old-password", "new-password"));

        assertEquals("new-hash", user.getSenhaHash());
        assertEquals(1, user.getTokenVersion());
        verify(users).findByIdForPasswordChange(userId);
        verify(users).save(user);
    }

    @Test void rejectsAnIncorrectCurrentPasswordWithoutSaving() {
        UUID userId = UUID.randomUUID();
        Usuario user = user(userId);
        user.setSenhaHash("old-hash");
        when(users.findByIdForPasswordChange(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "old-hash")).thenReturn(false);

        assertThrows(ApiException.class,
            () -> service.changePassword(userId, new ChangePasswordRequest("wrong-password", "new-password")));

        assertEquals(0, user.getTokenVersion());
        verify(users, never()).save(user);
    }

    @Test void rejectsTheSamePasswordWithoutSaving() {
        UUID userId = UUID.randomUUID();
        Usuario user = user(userId);
        user.setSenhaHash("old-hash");
        when(users.findByIdForPasswordChange(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("same-password", "old-hash")).thenReturn(true);

        assertThrows(ApiException.class,
            () -> service.changePassword(userId, new ChangePasswordRequest("same-password", "same-password")));

        assertEquals(0, user.getTokenVersion());
        verify(users, never()).save(user);
    }

    private Usuario user(UUID id) {
        Usuario user = new Usuario();
        user.setNome("Pessoa de teste");
        user.setEmail(id + "@example.test");
        user.setSenhaHash("not-a-real-password-hash");
        return user;
    }
}
