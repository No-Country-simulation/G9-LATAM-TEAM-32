package financial_analysis_api.repository;

import financial_analysis_api.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Acceso a datos de usuarios. Busqueda por email para login y validacion de duplicados.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
