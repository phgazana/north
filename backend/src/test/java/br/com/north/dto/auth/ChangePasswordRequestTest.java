package br.com.north.dto.auth;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChangePasswordRequestTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test void enforcesCharacterAndUtf8ByteLimitsForPasswordChange() {
        assertFalse(validator.validate(new ChangePasswordRequest("current", "short")).isEmpty());
        assertFalse(validator.validate(new ChangePasswordRequest("current", "x".repeat(73))).isEmpty());
        assertTrue(validator.validate(new ChangePasswordRequest("current", "x".repeat(72))).isEmpty());
        assertTrue(validator.validate(new ChangePasswordRequest("current", "é".repeat(36))).isEmpty());
        assertFalse(validator.validate(new ChangePasswordRequest("current", "é".repeat(37))).isEmpty());
        String validSurrogatePair = "pass" + new String(Character.toChars(0x1f600)).repeat(4);
        assertTrue(validator.validate(new ChangePasswordRequest("current", validSurrogatePair)).isEmpty());
        assertFalse(validator.validate(new ChangePasswordRequest("current", "1234567" + (char) 0xd800)).isEmpty());
        assertFalse(validator.validate(new ChangePasswordRequest("current", "1234567" + (char) 0xdc00)).isEmpty());
    }

    @Test void appliesTheSameByteLimitToRegistration() {
        assertTrue(validator.validate(new RegisterRequest("Nome", "a@example.test", "x".repeat(72))).isEmpty());
        assertTrue(validator.validate(new RegisterRequest("Nome", "a@example.test", "é".repeat(36))).isEmpty());
        assertFalse(validator.validate(new RegisterRequest("Nome", "a@example.test", "é".repeat(37))).isEmpty());
        String validSurrogatePair = "pass" + new String(Character.toChars(0x1f600)).repeat(4);
        assertTrue(validator.validate(new RegisterRequest("Nome", "a@example.test", validSurrogatePair)).isEmpty());
        assertFalse(validator.validate(new RegisterRequest("Nome", "a@example.test", "1234567" + (char) 0xd800)).isEmpty());
    }
}
