package financial_analysis_api.dto;

import lombok.Data;

/**
 * Resultado de clasificar una transaccion: la descripcion original,
 * la categoria asignada por el modelo y la probabilidad de acierto.
 */
@Data
public class CategoriaAsignadaDTO {

    private String descripcion;
    private String categoria;
    private Double probabilidad;
}
