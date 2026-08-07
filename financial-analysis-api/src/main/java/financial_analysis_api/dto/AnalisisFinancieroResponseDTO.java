package financial_analysis_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Respuesta del analisis financiero devuelta por el modelo de Python.
 * Incluye perfil, probabilidad, resumen de gastos por categoria y recomendaciones.
 */
@Data
public class AnalisisFinancieroResponseDTO {

    private String perfilFinanciero;
    @JsonProperty("probabilidad_riesgo")
    private Double probabilidad;
    @JsonProperty("resumen_gastos_por_categoria")
    private Map<String, BigDecimal> resumenGastos;
    private List<String> recomendaciones;
}
