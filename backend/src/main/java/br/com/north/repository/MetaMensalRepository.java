package br.com.north.repository;

import br.com.north.entity.MetaMensal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MetaMensalRepository extends JpaRepository<MetaMensal, UUID> {
    Optional<MetaMensal> findByUsuario_IdAndAnoAndMes(UUID usuarioId, short ano, short mes);
    List<MetaMensal> findAllByUsuario_IdAndAnoOrderByMesAsc(UUID usuarioId, short ano);
}
