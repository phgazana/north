package br.com.north.service;

import br.com.north.domain.ActivityStatus;
import br.com.north.domain.FinancialImpactStatus;
import br.com.north.domain.FinancialType;
import br.com.north.entity.Atividade;
import br.com.north.entity.MetaMensal;
import br.com.north.repository.AtividadeRepository;
import br.com.north.repository.MetaMensalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class ResumoMensalServiceTest {
    @Mock AtividadeRepository activities;
    @Mock MetaMensalRepository goals;
    private ResumoMensalService service;
    private final UUID userId = UUID.fromString("57a34c46-3456-4f50-905d-e8b218a81d67");

    @BeforeEach void setUp() { service = new ResumoMensalService(activities, goals); }

    @Test void calculatesRealizedResultProjectionAndGoalDistance() {
        Atividade realizedEntry = activity(ActivityStatus.CONCLUIDA);
        realizedEntry.setDataRealizada(LocalDate.of(2026, 10, 10));
        realizedEntry.setImpactoFinanceiroRealizado(FinancialImpactStatus.REALIZADO);
        realizedEntry.setTipoFinanceiroRealizado(FinancialType.ENTRADA);
        realizedEntry.setValorRealizado(new BigDecimal("2000.00"));

        Atividade realizedExit = activity(ActivityStatus.CONCLUIDA);
        realizedExit.setDataRealizada(LocalDate.of(2026, 10, 11));
        realizedExit.setImpactoFinanceiroRealizado(FinancialImpactStatus.REALIZADO);
        realizedExit.setTipoFinanceiroRealizado(FinancialType.SAIDA);
        realizedExit.setValorRealizado(new BigDecimal("800.00"));

        Atividade plannedEntry = activity(ActivityStatus.PENDENTE);
        plannedEntry.setDataPrevista(LocalDate.of(2026, 10, 20));
        plannedEntry.setImpactoFinanceiroPlanejado(FinancialImpactStatus.PLANEJADO);
        plannedEntry.setTipoFinanceiroPlanejado(FinancialType.ENTRADA);
        plannedEntry.setValorPlanejado(new BigDecimal("300.00"));

        Atividade plannedExit = activity(ActivityStatus.PENDENTE);
        plannedExit.setDataPrevista(LocalDate.of(2026, 10, 22));
        plannedExit.setImpactoFinanceiroPlanejado(FinancialImpactStatus.PLANEJADO);
        plannedExit.setTipoFinanceiroPlanejado(FinancialType.SAIDA);
        plannedExit.setValorPlanejado(new BigDecimal("100.00"));

        MetaMensal goal = new MetaMensal(); goal.setAno((short) 2026); goal.setMes((short) 10); goal.setValor(new BigDecimal("1500.00"));
        when(activities.findActiveForPeriod(userId, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31)))
            .thenReturn(List.of(realizedEntry, realizedExit, plannedEntry, plannedExit));
        when(goals.findByUsuario_IdAndAnoAndMes(userId, (short) 2026, (short) 10)).thenReturn(Optional.of(goal));

        var result = service.get(userId, 2026, 10);

        assertEquals(new BigDecimal("2000.00"), result.realizedEntries());
        assertEquals(new BigDecimal("800.00"), result.realizedExits());
        assertEquals(new BigDecimal("1200.00"), result.realizedResult());
        assertEquals(new BigDecimal("300.00"), result.plannedEntries());
        assertEquals(new BigDecimal("100.00"), result.plannedExits());
        assertEquals(new BigDecimal("1400.00"), result.projection());
        assertEquals(new BigDecimal("100.00"), result.distanceToGoal());
        assertEquals(new BigDecimal("80.00"), result.realizedPercentage());
        assertFalse(result.projectionPartial());
    }

    @Test void marksProjectionPartialOnlyWhenAnImpactIsExplicitlyUndefined() {
        Atividade unknown = activity(ActivityStatus.PENDENTE);
        unknown.setDataPrevista(LocalDate.of(2026, 10, 15));
        unknown.setImpactoFinanceiroPlanejado(FinancialImpactStatus.INDEFINIDO);
        when(activities.findActiveForPeriod(userId, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31)))
            .thenReturn(List.of(unknown));
        when(goals.findByUsuario_IdAndAnoAndMes(userId, (short) 2026, (short) 10)).thenReturn(Optional.empty());

        var result = service.get(userId, 2026, 10);

        assertTrue(result.projectionPartial());
        assertEquals(1, result.activitiesWithoutKnownPlannedValue());
        assertEquals(0, result.activitiesWithoutKnownRealizedValue());
        assertNull(result.goalValue());
        assertNull(result.distanceToGoal());
        assertNull(result.realizedPercentage());
    }

    @Test void historyLoadsActivitiesAndGoalsOnceForTheWholeYear() {
        when(activities.findActiveForPeriod(userId, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31)))
            .thenReturn(List.of());
        when(goals.findAllByUsuario_IdAndAnoOrderByMesAsc(userId, (short) 2026)).thenReturn(List.of());

        var result = service.history(userId, 2026);

        assertEquals(12, result.size());
        assertEquals(1, result.getFirst().month());
        assertEquals(12, result.getLast().month());
        verify(activities, times(1)).findActiveForPeriod(userId, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));
        verify(goals, times(1)).findAllByUsuario_IdAndAnoOrderByMesAsc(userId, (short) 2026);
    }

    @Test void completedActivityIsListedInItsRealizationMonthRatherThanItsPlannedMonth() {
        Atividade completed = activity(ActivityStatus.CONCLUIDA);
        completed.setDataPrevista(LocalDate.of(2026, 2, 12));
        completed.setDataRealizada(LocalDate.of(2026, 1, 29));
        completed.setImpactoFinanceiroRealizado(FinancialImpactStatus.REALIZADO);
        completed.setTipoFinanceiroRealizado(FinancialType.ENTRADA);
        completed.setValorRealizado(new BigDecimal("425.00"));
        when(activities.findActiveForPeriod(userId, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31)))
            .thenReturn(List.of(completed));
        when(goals.findAllByUsuario_IdAndAnoOrderByMesAsc(userId, (short) 2026)).thenReturn(List.of());

        var history = service.history(userId, 2026);
        var january = history.getFirst();
        var february = history.get(1);

        assertEquals(new BigDecimal("425.00"), january.realizedEntries());
        assertEquals(1, january.activities().size());
        assertEquals("Atividade de teste", january.activities().getFirst().title());
        assertEquals(LocalDate.of(2026, 1, 29), january.activities().getFirst().completedAt());
        assertTrue(february.activities().isEmpty());
    }

    private Atividade activity(ActivityStatus status) {
        Atividade activity = new Atividade();
        activity.setTitulo("Atividade de teste");
        activity.setIcone("other");
        activity.setEstado(status);
        return activity;
    }
}
