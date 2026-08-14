package financial_analysis_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AnalisisFinancieroResponseDTO {

    @JsonProperty("perfil_financiero")
    private String perfilFinanciero;

    @JsonProperty("probabilidad_riesgo")
    private Double probabilidad;

    @JsonProperty("resumen_gastos_por_categoria")
    private Map<String, BigDecimal> resumenGastos;

    private List<String> recomendaciones;

    @JsonProperty("total_gastado_local")
    private BigDecimal totalGastadoLocal;

    @JsonProperty("ratio_gasto_ingreso_pct")
    private Double ratioGastoIngresoPct;
}
