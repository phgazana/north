package br.com.north.service;

import br.com.north.domain.ActivityStatus;
import br.com.north.domain.FinancialType;
import br.com.north.domain.FinancialImpactStatus;
import br.com.north.dto.activity.ActivityResponse;
import br.com.north.dto.summary.MonthlySummaryResponse;
import br.com.north.entity.Atividade;
import br.com.north.entity.MetaMensal;
import br.com.north.exception.ApiException;
import br.com.north.repository.AtividadeRepository;
import br.com.north.repository.MetaMensalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ResumoMensalService {
    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private final AtividadeRepository activities;
    private final MetaMensalRepository goals;
    public ResumoMensalService(AtividadeRepository activities, MetaMensalRepository goals) { this.activities = activities; this.goals = goals; }

    @Transactional(readOnly = true)
    public List<MonthlySummaryResponse> history(UUID userId, int year) {
        if (year < 2000 || year > 2100) throw ApiException.badRequest("Ano inválido.");
        return java.util.stream.IntStream.rangeClosed(1, 12).mapToObj(month -> get(userId, year, month)).toList();
    }

    @Transactional(readOnly = true)
    public MonthlySummaryResponse get(UUID userId, int year, int month) {
        if (year < 2000 || year > 2100 || month < 1 || month > 12) throw ApiException.badRequest("Mês ou ano inválido.");
        YearMonth period = YearMonth.of(year, month);
        LocalDate start = period.atDay(1), end = period.atEndOfMonth();
        List<Atividade> all = activities.findAllByUsuario_IdAndExcluidaEmIsNull(userId);
        BigDecimal realizedEntries = sum(all, a -> a.getEstado() == ActivityStatus.CONCLUIDA && inRange(a.getDataRealizada(), start, end)
            && a.getTipoFinanceiroRealizado() == FinancialType.ENTRADA ? a.getValorRealizado() : null);
        BigDecimal realizedExits = sum(all, a -> a.getEstado() == ActivityStatus.CONCLUIDA && inRange(a.getDataRealizada(), start, end)
            && a.getTipoFinanceiroRealizado() == FinancialType.SAIDA ? a.getValorRealizado() : null);
        BigDecimal realizedResult = realizedEntries.subtract(realizedExits);
        List<Atividade> pendingPlanned = all.stream().filter(a -> a.getEstado() == ActivityStatus.PENDENTE && inRange(a.getDataPrevista(), start, end)).toList();
        BigDecimal plannedEntries = sum(pendingPlanned, a -> a.getTipoFinanceiroPlanejado() == FinancialType.ENTRADA ? a.getValorPlanejado() : null);
        BigDecimal plannedExits = sum(pendingPlanned, a -> a.getTipoFinanceiroPlanejado() == FinancialType.SAIDA ? a.getValorPlanejado() : null);
        int withoutKnownPlannedValue = (int) pendingPlanned.stream().filter(a -> a.getImpactoFinanceiroPlanejado() == FinancialImpactStatus.INDEFINIDO).count();
        int withoutKnownRealizedValue = (int) all.stream().filter(a -> a.getEstado() == ActivityStatus.CONCLUIDA
            && inRange(a.getDataRealizada(), start, end) && a.getImpactoFinanceiroRealizado() == FinancialImpactStatus.INDEFINIDO).count();
        BigDecimal projection = realizedResult.add(plannedEntries).subtract(plannedExits);
        MetaMensal goal = goals.findByUsuario_IdAndAnoAndMes(userId, (short) year, (short) month).orElse(null);
        BigDecimal goalValue = goal == null ? null : goal.getValor();
        BigDecimal distance = goalValue == null ? null : goalValue.subtract(projection);
        BigDecimal percentage = goalValue == null || goalValue.signum() <= 0 ? null : realizedResult.multiply(new BigDecimal("100"))
            .divide(goalValue, 2, RoundingMode.HALF_UP);

        // A lista mensal se organiza pela data prevista. A apuração financeira usa dataRealizada.
        // Para atividades sem data prevista, o mês de realização permite encontrá-las no histórico.
        List<ActivityResponse> related = all.stream()
            .filter(a -> inRange(a.getDataPrevista(), start, end) || (a.getDataPrevista() == null && inRange(a.getDataRealizada(), start, end)))
            .sorted(Comparator.comparing(Atividade::getDataPrevista, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Atividade::getHorarioPrevisto, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(ActivityResponse::from).toList();

        return new MonthlySummaryResponse(year, month, money(realizedEntries), money(realizedExits), money(realizedResult),
            money(plannedEntries), money(plannedExits), money(projection), goalValue, distance, percentage,
            withoutKnownPlannedValue + withoutKnownRealizedValue > 0, withoutKnownPlannedValue, withoutKnownRealizedValue, related);
    }
    private interface AmountSelector { BigDecimal select(Atividade activity); }
    private BigDecimal sum(List<Atividade> values, AmountSelector selector) {
        return values.stream().map(selector::select).filter(v -> v != null).reduce(ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
    }
    private boolean inRange(LocalDate value, LocalDate start, LocalDate end) { return value != null && !value.isBefore(start) && !value.isAfter(end); }
    private BigDecimal money(BigDecimal v) { return v.setScale(2, RoundingMode.HALF_UP); }
}
