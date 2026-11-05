package br.com.north.entity;

import br.com.north.domain.ActivityStatus;
import br.com.north.domain.FinancialType;
import br.com.north.domain.FinancialImpactStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "atividades")
public class Atividade {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    @Column(name = "titulo", nullable = false, length = 120)
    private String titulo;
    @Column(name = "descricao", length = 1000)
    private String descricao;
    @Column(name = "observacao", length = 2000)
    private String observacao;
    @Column(name = "icone", nullable = false, length = 32)
    private String icone = "other";
    @Column(name = "data_prevista")
    private LocalDate dataPrevista;
    @Column(name = "horario_previsto")
    private LocalTime horarioPrevisto;
    @Column(name = "prioridade", nullable = false)
    private boolean prioridade;
    @Column(name = "favorita", nullable = false)
    private boolean favorita;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "estado", nullable = false, columnDefinition = "estado_atividade")
    private ActivityStatus estado = ActivityStatus.PENDENTE;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "impacto_financeiro_planejado", nullable = false, columnDefinition = "impacto_financeiro")
    private FinancialImpactStatus impactoFinanceiroPlanejado = FinancialImpactStatus.SEM_IMPACTO;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "tipo_financeiro_planejado", columnDefinition = "tipo_financeiro")
    private FinancialType tipoFinanceiroPlanejado;
    @Column(name = "valor_planejado", precision = 14, scale = 2)
    private BigDecimal valorPlanejado;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "impacto_financeiro_realizado", columnDefinition = "impacto_financeiro")
    private FinancialImpactStatus impactoFinanceiroRealizado;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "tipo_financeiro_realizado", columnDefinition = "tipo_financeiro")
    private FinancialType tipoFinanceiroRealizado;
    @Column(name = "valor_realizado", precision = 14, scale = 2)
    private BigDecimal valorRealizado;
    @Column(name = "data_realizada")
    private LocalDate dataRealizada;
    @Column(name = "cancelada_em")
    private OffsetDateTime canceladaEm;
    @Column(name = "excluida_em")
    private OffsetDateTime excluidaEm;
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist void onCreate() { var now = OffsetDateTime.now(ZoneOffset.UTC); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(ZoneOffset.UTC); }

    public UUID getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
    public LocalDate getDataPrevista() { return dataPrevista; }
    public void setDataPrevista(LocalDate dataPrevista) { this.dataPrevista = dataPrevista; }
    public LocalTime getHorarioPrevisto() { return horarioPrevisto; }
    public void setHorarioPrevisto(LocalTime horarioPrevisto) { this.horarioPrevisto = horarioPrevisto; }
    public boolean isPrioridade() { return prioridade; }
    public void setPrioridade(boolean prioridade) { this.prioridade = prioridade; }
    public boolean isFavorita() { return favorita; }
    public void setFavorita(boolean favorita) { this.favorita = favorita; }
    public ActivityStatus getEstado() { return estado; }
    public void setEstado(ActivityStatus estado) { this.estado = estado; }
    public FinancialImpactStatus getImpactoFinanceiroPlanejado() { return impactoFinanceiroPlanejado; }
    public void setImpactoFinanceiroPlanejado(FinancialImpactStatus value) { this.impactoFinanceiroPlanejado = value; }
    public FinancialType getTipoFinanceiroPlanejado() { return tipoFinanceiroPlanejado; }
    public void setTipoFinanceiroPlanejado(FinancialType tipoFinanceiroPlanejado) { this.tipoFinanceiroPlanejado = tipoFinanceiroPlanejado; }
    public BigDecimal getValorPlanejado() { return valorPlanejado; }
    public void setValorPlanejado(BigDecimal valorPlanejado) { this.valorPlanejado = valorPlanejado; }
    public FinancialImpactStatus getImpactoFinanceiroRealizado() { return impactoFinanceiroRealizado; }
    public void setImpactoFinanceiroRealizado(FinancialImpactStatus value) { this.impactoFinanceiroRealizado = value; }
    public FinancialType getTipoFinanceiroRealizado() { return tipoFinanceiroRealizado; }
    public void setTipoFinanceiroRealizado(FinancialType tipoFinanceiroRealizado) { this.tipoFinanceiroRealizado = tipoFinanceiroRealizado; }
    public BigDecimal getValorRealizado() { return valorRealizado; }
    public void setValorRealizado(BigDecimal valorRealizado) { this.valorRealizado = valorRealizado; }
    public LocalDate getDataRealizada() { return dataRealizada; }
    public void setDataRealizada(LocalDate dataRealizada) { this.dataRealizada = dataRealizada; }
    public OffsetDateTime getCanceladaEm() { return canceladaEm; }
    public void setCanceladaEm(OffsetDateTime canceladaEm) { this.canceladaEm = canceladaEm; }
    public OffsetDateTime getExcluidaEm() { return excluidaEm; }
    public void setExcluidaEm(OffsetDateTime excluidaEm) { this.excluidaEm = excluidaEm; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
