package financial_analysis_api.dto;

import lombok.Data;

import java.util.List;

/**
 * Respuesta con la lista de transacciones ya clasificadas por categoria.
 */
@Data
public class ClasificacionTransaccionResponseDTO {

    private List<CategoriaAsignadaDTO> clasificaciones;
}
