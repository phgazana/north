package br.com.north.service;

import br.com.north.dto.auth.UpdatePreferencesRequest;
import br.com.north.entity.Usuario;
import br.com.north.exception.ApiException;
import br.com.north.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    @Mock UsuarioRepository users;
    private AccountService service;

    @BeforeEach void setUp() { service = new AccountService(users); }

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

    private Usuario user(UUID id) {
        Usuario user = new Usuario();
        user.setNome("Pessoa de teste");
        user.setEmail(id + "@example.test");
        user.setSenhaHash("not-a-real-password-hash");
        return user;
    }
}
