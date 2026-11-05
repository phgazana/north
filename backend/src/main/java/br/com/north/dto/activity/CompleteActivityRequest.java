package br.com.north.dto.activity;

import br.com.north.domain.FinancialType;
import br.com.north.domain.FinancialImpactStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CompleteActivityRequest(
    LocalDate realizedAt,
    FinancialImpactStatus realizedImpactStatus,
    FinancialType realizedType,
    @DecimalMin(value = "0.01", message = "O valor realizado deve ser maior que zero.") BigDecimal realizedValue,
    @Size(max = 2000) String observation
) {}
