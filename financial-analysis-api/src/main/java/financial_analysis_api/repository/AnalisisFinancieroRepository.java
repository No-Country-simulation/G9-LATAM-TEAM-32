package financial_analysis_api.repository;

import financial_analysis_api.domain.AnalisisFinanciero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Acceso a datos de analisis financieros. Permite consultar historial por usuario.
 */
public interface AnalisisFinancieroRepository extends JpaRepository<AnalisisFinanciero, UUID> {

    List<AnalisisFinanciero> findByUsuarioIdOrderByFechaAnalisisDesc(UUID usuarioId);
}
