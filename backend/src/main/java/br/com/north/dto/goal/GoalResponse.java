package br.com.north.dto.goal;

import br.com.north.entity.MetaMensal;
import java.math.BigDecimal;
import java.util.UUID;

public record GoalResponse(UUID id, int year, int month, BigDecimal value) {
    public static GoalResponse from(MetaMensal goal) { return new GoalResponse(goal.getId(), goal.getAno(), goal.getMes(), goal.getValor()); }
}
