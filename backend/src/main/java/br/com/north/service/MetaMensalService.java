package br.com.north.service;

import br.com.north.dto.goal.GoalRequest;
import br.com.north.dto.goal.GoalResponse;
import br.com.north.entity.MetaMensal;
import br.com.north.entity.Usuario;
import br.com.north.exception.ApiException;
import br.com.north.repository.MetaMensalRepository;
import br.com.north.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class MetaMensalService {
    private final MetaMensalRepository goals;
    private final UsuarioRepository users;
    public MetaMensalService(MetaMensalRepository goals, UsuarioRepository users) { this.goals = goals; this.users = users; }
    @Transactional(readOnly = true)
    public List<GoalResponse> listByYear(UUID userId, int year) {
        if (year < 2000 || year > 2100) throw ApiException.badRequest("Ano inválido.");
        return goals.findAllByUsuario_IdAndAnoOrderByMesAsc(userId, (short) year).stream().map(GoalResponse::from).toList();
    }
    @Transactional(readOnly = true)
    public GoalResponse get(UUID userId, int year, int month) {
        validatePeriod(year, month);
        return goals.findByUsuario_IdAndAnoAndMes(userId, (short) year, (short) month).map(GoalResponse::from).orElse(null);
    }
    @Transactional
    public GoalResponse upsert(UUID userId, GoalRequest request) {
        validatePeriod(request.year(), request.month());
        Usuario user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        MetaMensal goal = goals.findByUsuario_IdAndAnoAndMes(userId, (short) request.year(), (short) request.month()).orElseGet(MetaMensal::new);
        goal.setUsuario(user); goal.setAno((short) request.year()); goal.setMes((short) request.month()); goal.setValor(request.value());
        return GoalResponse.from(goals.save(goal));
    }
    private void validatePeriod(int year, int month) {
        if (year < 2000 || year > 2100 || month < 1 || month > 12) throw ApiException.badRequest("Mês ou ano inválido.");
    }
}
