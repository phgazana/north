package br.com.north.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private static final SecretKey KEY = Keys.hmacShaKeyFor("north-test-key-with-at-least-32-bytes".getBytes());
    private JwtService jwt;

    @BeforeEach void setUp() { jwt = new JwtService(Encoders.BASE64.encode(KEY.getEncoded()), 720); }

    @Test void rejectsAnEarlierTokenAfterTheUsersVersionChanges() {
        UserPrincipal beforeChange = principal(UUID.randomUUID(), 0);
        String token = jwt.generate(beforeChange);

        assertFalse(jwt.isValid(token, principal(beforeChange.getId(), 1)));
    }

    @Test void rejectsLegacyTokensWithoutVersionClaim() {
        UserPrincipal user = principal(UUID.randomUUID(), 0);
        String token = Jwts.builder().subject(user.getEmail()).claim("uid", user.getId().toString())
            .issuedAt(Date.from(Instant.now())).expiration(Date.from(Instant.now().plusSeconds(3600)))
            .signWith(KEY).compact();

        assertFalse(jwt.isValid(token, user));
    }

    @Test void rejectsTokensWhoseUuidDoesNotMatchTheLoadedUser() {
        UserPrincipal user = principal(UUID.randomUUID(), 0);
        String token = Jwts.builder().subject(user.getEmail()).claim("uid", UUID.randomUUID().toString())
            .claim("token_version", user.getTokenVersion())
            .issuedAt(Date.from(Instant.now())).expiration(Date.from(Instant.now().plusSeconds(3600)))
            .signWith(KEY).compact();

        assertFalse(jwt.isValid(token, user));
    }

    @Test void changingOneUsersVersionDoesNotInvalidateAnotherUsersToken() {
        UserPrincipal beforeChange = principal(UUID.randomUUID(), 0);
        UserPrincipal changedUser = principal(UUID.randomUUID(), 1);
        UserPrincipal otherUser = principal(UUID.randomUUID(), 0);
        String tokenForChangedUser = jwt.generate(beforeChange);
        String token = jwt.generate(otherUser);

        assertFalse(jwt.isValid(tokenForChangedUser, changedUser));
        assertTrue(jwt.isValid(token, otherUser));
    }

    private UserPrincipal principal(UUID id, int version) {
        return new UserPrincipal(id, "Pessoa de teste", id + "@example.test", "hash", version);
    }
}
