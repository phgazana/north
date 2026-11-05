package br.com.north.dto.goal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GoalRequest(
    @Min(2000) @Max(2100) int year,
    @Min(1) @Max(12) int month,
    @NotNull @DecimalMin(value = "0.01", message = "A meta deve ser maior que zero.") BigDecimal value
) {}
