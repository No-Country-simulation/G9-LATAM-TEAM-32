package financial_analysis_api.repository;

import financial_analysis_api.domain.ImportacionCsv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Acceso a datos de importaciones CSV. Permite consultar historial por usuario.
 */
public interface ImportacionCsvRepository extends JpaRepository<ImportacionCsv, UUID> {

    List<ImportacionCsv> findByUsuarioIdOrderByFechaDesc(UUID usuarioId);
}
