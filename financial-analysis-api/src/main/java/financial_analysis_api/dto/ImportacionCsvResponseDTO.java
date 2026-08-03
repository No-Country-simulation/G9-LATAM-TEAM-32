package financial_analysis_api.dto;

import lombok.Data;

import java.util.List;

/**
 * Respuesta tras importar un archivo CSV de transacciones.
 * Informa cuantas filas se procesaron, cuantas fueron validas/error,
 * y las clasificaciones resultantes.
 */
@Data
public class ImportacionCsvResponseDTO {

    private Integer totalFilas;
    private Integer filasValidas;
    private Integer filasError;
    private List<CategoriaAsignadaDTO> clasificaciones;
}
