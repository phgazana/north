package br.com.north.repository;

import br.com.north.entity.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AtividadeRepository extends JpaRepository<Atividade, UUID> {
    List<Atividade> findAllByUsuario_IdAndExcluidaEmIsNull(UUID usuarioId);
    List<Atividade> findAllByUsuario_IdAndExcluidaEmIsNotNullOrderByExcluidaEmDesc(UUID usuarioId);
    Optional<Atividade> findByIdAndUsuario_Id(UUID id, UUID usuarioId);

    @Query("""
        select a from Atividade a
        where a.usuario.id = :usuarioId
          and a.excluidaEm is null
          and (a.dataPrevista between :inicio and :fim or a.dataRealizada between :inicio and :fim)
        order by a.dataPrevista asc, a.prioridade desc, a.horarioPrevisto asc
        """)
    List<Atividade> findActiveForPeriod(@Param("usuarioId") UUID usuarioId,
                                       @Param("inicio") LocalDate inicio,
                                       @Param("fim") LocalDate fim);

    @Modifying
    @Transactional
    @Query("delete from Atividade a where a.excluidaEm is not null and a.excluidaEm < :cutoff")
    int deleteExpiredTrash(@Param("cutoff") OffsetDateTime cutoff);
}
