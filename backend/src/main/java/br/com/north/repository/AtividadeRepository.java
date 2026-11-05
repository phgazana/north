package br.com.north.repository;

import br.com.north.entity.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AtividadeRepository extends JpaRepository<Atividade, UUID> {
    List<Atividade> findAllByUsuario_IdAndExcluidaEmIsNull(UUID usuarioId);
    List<Atividade> findAllByUsuario_IdAndExcluidaEmIsNotNullOrderByExcluidaEmDesc(UUID usuarioId);
    Optional<Atividade> findByIdAndUsuario_Id(UUID id, UUID usuarioId);

    @Modifying
    @Transactional
    @Query("delete from Atividade a where a.excluidaEm is not null and a.excluidaEm < :cutoff")
    int deleteExpiredTrash(@Param("cutoff") OffsetDateTime cutoff);
}
