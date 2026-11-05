package br.com.north.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(Instant timestamp, int status, String code, String message, Map<String, String> fields) {
    public ApiError(Instant timestamp, int status, String code, String message) {
        this(timestamp, status, code, message, Map.of());
    }
}
