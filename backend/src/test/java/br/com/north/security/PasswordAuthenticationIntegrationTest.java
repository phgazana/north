package br.com.north.security;

import br.com.north.config.SecurityConfig;
import br.com.north.controller.AccountController;
import br.com.north.dto.auth.ChangePasswordRequest;
import br.com.north.service.AccountService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AccountController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
@ImportAutoConfiguration(exclude = UserDetailsServiceAutoConfiguration.class)
class PasswordAuthenticationIntegrationTest {
    private static final String BASE64_SECRET = Encoders.BASE64.encode(
        "north-integration-test-key-with-more-than-32-bytes".getBytes(StandardCharsets.UTF_8));
    private static final SecretKey KEY = Keys.hmacShaKeyFor(
        io.jsonwebtoken.io.Decoders.BASE64.decode(BASE64_SECRET));
    private static final String EMAIL = "user@example.test";
    private static final String BODY = "{\"currentPassword\":\"current-password\",\"newPassword\":\"new-password-123\"}";

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean AccountService accountService;
    @MockitoBean NorthUserDetailsService userDetailsService;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> BASE64_SECRET);
        registry.add("app.jwt.expiration-minutes", () -> "720");
        registry.add("app.cors.allowed-origins", () -> "http://localhost:8081");
    }

    @Test void protectsTheRealPasswordRouteWhenNoTokenIsProvided() throws Exception {
        mvc.perform(patch("/api/me/password").contentType("application/json").content(BODY))
            .andExpect(status().isUnauthorized());
        verify(accountService, never()).changePassword(any(), any());
    }

    @Test void rejectsTokenIssuedBeforePasswordChange() throws Exception {
        UUID id = UUID.randomUUID();
        String token = jwt.generate(principal(id, 0));
        stubUser(principal(id, 1));

        expectUnauthorized(token);
    }

    @Test void rejectsTokenWithoutVersionClaim() throws Exception {
        UserPrincipal user = principal(UUID.randomUUID(), 0);
        String token = Jwts.builder().subject(user.getEmail()).claim("uid", user.getId().toString())
            .issuedAt(Date.from(Instant.now())).expiration(Date.from(Instant.now().plusSeconds(3600)))
            .signWith(KEY).compact();
        stubUser(user);

        expectUnauthorized(token);
    }

    @Test void rejectsTokenWithDivergentVersion() throws Exception {
        UUID id = UUID.randomUUID();
        String token = jwt.generate(principal(id, 3));
        stubUser(principal(id, 4));

        expectUnauthorized(token);
    }

    @Test void rejectsTokenWithMismatchedUid() throws Exception {
        UserPrincipal user = principal(UUID.randomUUID(), 0);
        String token = Jwts.builder().subject(user.getEmail()).claim("uid", UUID.randomUUID().toString())
            .claim("token_version", user.getTokenVersion())
            .issuedAt(Date.from(Instant.now())).expiration(Date.from(Instant.now().plusSeconds(3600)))
            .signWith(KEY).compact();
        stubUser(user);

        expectUnauthorized(token);
    }

    @Test void acceptsAnotherUsersValidTokenAndPassesOnlyThatPrincipalIdToTheOperation() throws Exception {
        UserPrincipal otherUser = principal(UUID.randomUUID(), 0);
        stubUser(otherUser);

        mvc.perform(patch("/api/me/password")
                .header("Authorization", "Bearer " + jwt.generate(otherUser))
                .contentType("application/json").content(BODY))
            .andExpect(status().isNoContent());

        verify(accountService).changePassword(otherUser.getId(),
            new ChangePasswordRequest("current-password", "new-password-123"));
    }

    private void expectUnauthorized(String token) throws Exception {
        mvc.perform(patch("/api/me/password").header("Authorization", "Bearer " + token)
                .contentType("application/json").content(BODY))
            .andExpect(status().isUnauthorized());
        verify(accountService, never()).changePassword(any(), any());
    }

    private void stubUser(UserPrincipal user) {
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);
    }

    private UserPrincipal principal(UUID id, int version) {
        return new UserPrincipal(id, "Pessoa de teste", EMAIL, "hash", version);
    }
}
