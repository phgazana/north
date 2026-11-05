package br.com.north.dto.summary;

import br.com.north.dto.activity.ActivityResponse;
import java.math.BigDecimal;
import java.util.List;

public record MonthlySummaryResponse(
    int year, int month,
    BigDecimal realizedEntries, BigDecimal realizedExits, BigDecimal realizedResult,
    BigDecimal plannedEntries, BigDecimal plannedExits, BigDecimal projection,
    BigDecimal goalValue, BigDecimal distanceToGoal, BigDecimal realizedPercentage,
    boolean projectionPartial, int activitiesWithoutKnownPlannedValue, int activitiesWithoutKnownRealizedValue,
    List<ActivityResponse> activities
) {}
