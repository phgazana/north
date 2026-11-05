package br.com.north.dto.activity;

import jakarta.validation.constraints.NotNull;

public record BooleanRequest(@NotNull Boolean value) {}
