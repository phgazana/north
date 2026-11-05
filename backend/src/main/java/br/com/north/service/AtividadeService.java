package br.com.north.service;

import br.com.north.domain.ActivityIcon;
import br.com.north.domain.ActivityStatus;
import br.com.north.domain.FinancialType;
import br.com.north.domain.FinancialImpactStatus;
import br.com.north.dto.activity.*;
import br.com.north.entity.Atividade;
import br.com.north.entity.Usuario;
import br.com.north.exception.ApiException;
import br.com.north.repository.AtividadeRepository;
import br.com.north.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.Locale;
import java.util.stream.Stream;

@Service
public class AtividadeService {
    private final AtividadeRepository activities;
    private final UsuarioRepository users;
    private final int retentionDays;
    public AtividadeService(AtividadeRepository activities, UsuarioRepository users,
                            @Value("${app.trash.retention-days:30}") int retentionDays) {
        this.activities = activities; this.users = users; this.retentionDays = retentionDays;
    }
    @Transactional(readOnly = true)
    public List<ActivityResponse> list(UUID userId, ActivityStatus status, LocalDate from, LocalDate to,
                                       FinancialType type, Boolean priority, Boolean favorite, String search) {
        Stream<Atividade> stream = activities.findAllByUsuario_IdAndExcluidaEmIsNull(userId).stream();
        if (status != null) stream = stream.filter(a -> a.getEstado() == status);
        if (from != null) stream = stream.filter(a -> a.getDataPrevista() != null && !a.getDataPrevista().isBefore(from));
        if (to != null) stream = stream.filter(a -> a.getDataPrevista() != null && !a.getDataPrevista().isAfter(to));
        if (type != null) stream = stream.filter(a -> effectiveFinancialType(a) == type);
        if (priority != null) stream = stream.filter(a -> a.isPrioridade() == priority);
        if (favorite != null) stream = stream.filter(a -> a.isFavorita() == favorite);
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase(Locale.ROOT);
            stream = stream.filter(a -> contains(a.getTitulo(), q) || contains(a.getDescricao(), q) || contains(a.getObservacao(), q));
        }
        return stream.sorted(Comparator.comparing(Atividade::getDataPrevista, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(Atividade::isPrioridade, Comparator.reverseOrder())
            .thenComparing(Atividade::getHorarioPrevisto, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(ActivityResponse::from).toList();
    }
    @Transactional(readOnly = true)
    public List<ActivityResponse> trash(UUID userId) {
        OffsetDateTime cutoff = now().minusDays(retentionDays);
        return activities.findAllByUsuario_IdAndExcluidaEmIsNotNullOrderByExcluidaEmDesc(userId).stream()
            .filter(a -> a.getExcluidaEm().isAfter(cutoff))
            .map(ActivityResponse::from).toList();
    }
    @Transactional(readOnly = true)
    public ActivityResponse get(UUID userId, UUID id) { return ActivityResponse.from(active(userId, id)); }
    @Transactional
    public ActivityResponse create(UUID userId, ActivityRequest request) {
        validateFinancialPair(request.plannedType(), request.plannedValue(), "planejado");
        resolvePlannedImpact(request);
        validateIcon(request.icon());
        Usuario user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
        Atividade a = new Atividade(); a.setUsuario(user); applyRequest(a, request); a.setEstado(ActivityStatus.PENDENTE);
        return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse update(UUID userId, UUID id, ActivityRequest request) {
        Atividade a = active(userId, id);
        if (a.getEstado() == ActivityStatus.CONCLUIDA) throw ApiException.conflict("Reabra a atividade antes de editar seus dados.");
        validateFinancialPair(request.plannedType(), request.plannedValue(), "planejado");
        resolvePlannedImpact(request);
        validateIcon(request.icon()); applyRequest(a, request);
        return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse complete(UUID userId, UUID id, CompleteActivityRequest request) {
        Atividade a = active(userId, id);
        if (a.getEstado() != ActivityStatus.PENDENTE) throw ApiException.conflict("Somente atividades pendentes podem ser concluídas.");
        validateFinancialPair(request.realizedType(), request.realizedValue(), "realizado");
        FinancialImpactStatus realizedStatus = resolveRealizedImpact(request);
        a.setEstado(ActivityStatus.CONCLUIDA);
        a.setDataRealizada(request.realizedAt() == null ? LocalDate.now(ZoneId.of("America/Sao_Paulo")) : request.realizedAt());
        a.setImpactoFinanceiroRealizado(realizedStatus);
        a.setTipoFinanceiroRealizado(request.realizedType());
        a.setValorRealizado(request.realizedValue());
        if (request.observation() != null) a.setObservacao(request.observation());
        a.setCanceladaEm(null);
        return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse reopen(UUID userId, UUID id) {
        Atividade a = active(userId, id);
        if (a.getEstado() == ActivityStatus.PENDENTE) throw ApiException.conflict("A atividade já está pendente.");
        a.setEstado(ActivityStatus.PENDENTE); a.setDataRealizada(null); a.setImpactoFinanceiroRealizado(null);
        a.setTipoFinanceiroRealizado(null); a.setValorRealizado(null); a.setCanceladaEm(null);
        return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse cancel(UUID userId, UUID id) {
        Atividade a = active(userId, id);
        if (a.getEstado() != ActivityStatus.PENDENTE) throw ApiException.conflict("Somente atividades pendentes podem ser canceladas. Reabra a atividade se necessário.");
        a.setEstado(ActivityStatus.CANCELADA); a.setCanceladaEm(now());
        return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse duplicate(UUID userId, UUID id) {
        Atividade source = active(userId, id);
        Atividade copy = new Atividade(); copy.setUsuario(source.getUsuario());
        copy.setTitulo(source.getTitulo()); copy.setDescricao(source.getDescricao()); copy.setObservacao(source.getObservacao());
        copy.setIcone(source.getIcone()); copy.setDataPrevista(source.getDataPrevista()); copy.setHorarioPrevisto(source.getHorarioPrevisto());
        copy.setPrioridade(source.isPrioridade()); copy.setFavorita(false); copy.setEstado(ActivityStatus.PENDENTE);
        copy.setImpactoFinanceiroPlanejado(source.getImpactoFinanceiroPlanejado());
        copy.setTipoFinanceiroPlanejado(source.getTipoFinanceiroPlanejado()); copy.setValorPlanejado(source.getValorPlanejado());
        return ActivityResponse.from(activities.save(copy));
    }
    @Transactional
    public ActivityResponse setFavorite(UUID userId, UUID id, boolean value) {
        Atividade a = active(userId, id); a.setFavorita(value); return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse setPriority(UUID userId, UUID id, boolean value) {
        Atividade a = active(userId, id); a.setPrioridade(value); return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse moveToTrash(UUID userId, UUID id) {
        Atividade a = active(userId, id); a.setExcluidaEm(now()); return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public ActivityResponse restore(UUID userId, UUID id) {
        Atividade a = activities.findByIdAndUsuario_Id(id, userId).filter(x -> x.getExcluidaEm() != null)
            .orElseThrow(() -> ApiException.notFound("Atividade não encontrada na lixeira."));
        if (a.getExcluidaEm().isBefore(now().minusDays(retentionDays))) throw ApiException.gone("O prazo para restaurar esta atividade terminou.");
        a.setExcluidaEm(null); return ActivityResponse.from(activities.save(a));
    }
    @Transactional
    public void deletePermanently(UUID userId, UUID id) {
        Atividade a = activities.findByIdAndUsuario_Id(id, userId).filter(x -> x.getExcluidaEm() != null)
            .orElseThrow(() -> ApiException.notFound("Atividade não encontrada na lixeira."));
        activities.delete(a);
    }
    private Atividade active(UUID userId, UUID id) {
        return activities.findByIdAndUsuario_Id(id, userId).filter(a -> a.getExcluidaEm() == null)
            .orElseThrow(() -> ApiException.notFound("Atividade não encontrada."));
    }
    private void applyRequest(Atividade a, ActivityRequest r) {
        a.setTitulo(r.title().trim()); a.setIcone(r.icon()); a.setDataPrevista(r.date()); a.setHorarioPrevisto(r.time());
        a.setPrioridade(r.priority()); a.setFavorita(r.favorite()); a.setImpactoFinanceiroPlanejado(resolvePlannedImpact(r)); a.setTipoFinanceiroPlanejado(r.plannedType());
        a.setValorPlanejado(r.plannedValue()); a.setDescricao(blankToNull(r.description())); a.setObservacao(blankToNull(r.observation()));
    }

    private FinancialImpactStatus resolvePlannedImpact(ActivityRequest request) {
        if (request.plannedType() != null && request.plannedValue() != null) {
            if (request.plannedImpactStatus() != null && request.plannedImpactStatus() != FinancialImpactStatus.PLANEJADO)
                throw ApiException.badRequest("Uma atividade com tipo e valor planejados deve usar o estado PLANEJADO.");
            return FinancialImpactStatus.PLANEJADO;
        }
        FinancialImpactStatus requested = request.plannedImpactStatus();
        if (requested == null || requested == FinancialImpactStatus.SEM_IMPACTO) return FinancialImpactStatus.SEM_IMPACTO;
        if (requested == FinancialImpactStatus.INDEFINIDO) return requested;
        throw ApiException.badRequest("O estado PLANEJADO exige tipo e valor financeiros.");
    }
    private FinancialImpactStatus resolveRealizedImpact(CompleteActivityRequest request) {
        if (request.realizedType() != null && request.realizedValue() != null) {
            if (request.realizedImpactStatus() != null && request.realizedImpactStatus() != FinancialImpactStatus.REALIZADO)
                throw ApiException.badRequest("Uma atividade com tipo e valor realizados deve usar o estado REALIZADO.");
            return FinancialImpactStatus.REALIZADO;
        }
        FinancialImpactStatus requested = request.realizedImpactStatus();
        if (requested == null || requested == FinancialImpactStatus.SEM_IMPACTO) return FinancialImpactStatus.SEM_IMPACTO;
        if (requested == FinancialImpactStatus.INDEFINIDO) return requested;
        throw ApiException.badRequest("O estado REALIZADO exige tipo e valor financeiros.");
    }
    private void validateIcon(String icon) { if (!ActivityIcon.isAllowed(icon)) throw ApiException.badRequest("Ícone de atividade inválido."); }
    private void validateFinancialPair(FinancialType type, BigDecimal value, String label) {
        if ((type == null) != (value == null)) throw ApiException.badRequest("Tipo e valor financeiro " + label + " devem ser informados juntos.");
        if (value != null && value.signum() <= 0) throw ApiException.badRequest("O valor financeiro deve ser maior que zero.");
    }
    private FinancialType effectiveFinancialType(Atividade a) { return a.getEstado() == ActivityStatus.CONCLUIDA ? a.getTipoFinanceiroRealizado() : a.getTipoFinanceiroPlanejado(); }
    private boolean contains(String value, String q) { return value != null && value.toLowerCase(Locale.ROOT).contains(q); }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private OffsetDateTime now() { return OffsetDateTime.now(ZoneOffset.UTC); }
}
