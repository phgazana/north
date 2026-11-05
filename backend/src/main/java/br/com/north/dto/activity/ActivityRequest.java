package br.com.north.dto.activity;

import br.com.north.domain.FinancialType;
import br.com.north.domain.FinancialImpactStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ActivityRequest(
    @NotBlank @Size(max = 120) String title,
    @NotBlank @Pattern(regexp = "market|study|work|health|home|payment|leisure|other") String icon,
    LocalDate date,
    LocalTime time,
    boolean priority,
    boolean favorite,
    FinancialImpactStatus plannedImpactStatus,
    FinancialType plannedType,
    @DecimalMin(value = "0.01", message = "O valor planejado deve ser maior que zero.") BigDecimal plannedValue,
    @Size(max = 1000) String description,
    @Size(max = 2000) String observation
) {}
