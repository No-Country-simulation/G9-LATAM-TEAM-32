package financial_analysis_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AnalisisFinancieroRequestDTO {

    @NotNull(message = "El ingreso mensual es obligatorio")
    @JsonProperty("ingreso_mensual")
    private BigDecimal ingresoMensual;

    @NotNull(message = "El nivel de endeudamiento es obligatorio")
    @JsonProperty("nivel_endeudamiento")
    private Integer nivelEndeudamiento;

    @NotNull(message = "La frecuencia de ahorro es obligatoria")
    @JsonProperty("frecuencia_ahorro")
    private String frecuenciaAhorro;

    @JsonProperty("moneda_local_usuario")
    private String monedaLocalUsuario = "COP";

    @NotEmpty(message = "Debe incluir al menos una transaccion")
    @Valid
    private List<TransaccionDTO> transacciones;
}
