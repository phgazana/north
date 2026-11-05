package br.com.north.security;

import br.com.north.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMinutes;
    public JwtService(@Value("${app.jwt.secret}") String base64Secret,
                      @Value("${app.jwt.expiration-minutes:720}") long expirationMinutes) {
        try {
            this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        } catch (RuntimeException ex) {
            throw new IllegalStateException("JWT_SECRET deve ser uma chave Base64 forte com pelo menos 32 bytes.", ex);
        }
        this.expirationMinutes = expirationMinutes;
    }
    public String generate(UserPrincipal user) {
        Instant now = Instant.now();
        return Jwts.builder().subject(user.getEmail()).claim("uid", user.getId().toString())
            .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
            .signWith(key).compact();
    }
    public String extractEmail(String token) {
        try { return parse(token).getSubject(); }
        catch (JwtException | IllegalArgumentException ex) { return null; }
    }
    public boolean isValid(String token, UserPrincipal user) {
        try { Claims claims = parse(token); return claims.getSubject().equalsIgnoreCase(user.getEmail()) && claims.getExpiration().after(new Date()); }
        catch (JwtException | IllegalArgumentException ex) { return false; }
    }
    public long getExpirationSeconds() { return expirationMinutes * 60; }
    private Claims parse(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
