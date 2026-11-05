package br.com.north.dto.activity;

import br.com.north.domain.ActivityStatus;
import br.com.north.domain.FinancialType;
import br.com.north.domain.FinancialImpactStatus;
import br.com.north.entity.Atividade;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ActivityResponse(
    UUID id, String title, String icon, LocalDate date, LocalTime time,
    boolean priority, ActivityStatus status,
    FinancialImpactStatus plannedImpactStatus, FinancialType plannedType, BigDecimal plannedValue,
    FinancialImpactStatus realizedImpactStatus, FinancialType realizedType, BigDecimal realizedValue, LocalDate completedAt,
    String description, String observation, OffsetDateTime deletedAt, OffsetDateTime canceledAt,
    boolean favorite, OffsetDateTime createdAt, OffsetDateTime updatedAt
) {
    public static ActivityResponse from(Atividade a) {
        return new ActivityResponse(a.getId(), a.getTitulo(), a.getIcone(), a.getDataPrevista(), a.getHorarioPrevisto(),
            a.isPrioridade(), a.getEstado(), a.getImpactoFinanceiroPlanejado(), a.getTipoFinanceiroPlanejado(), a.getValorPlanejado(),
            a.getImpactoFinanceiroRealizado(), a.getTipoFinanceiroRealizado(), a.getValorRealizado(), a.getDataRealizada(), a.getDescricao(),
            a.getObservacao(), a.getExcluidaEm(), a.getCanceladaEm(), a.isFavorita(), a.getCreatedAt(), a.getUpdatedAt());
    }
}
