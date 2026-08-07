package financial_analysis_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Entrada para solicitar un analisis financiero.
 * Contiene el ingreso mensual, nivel de endeudamiento, frecuencia de ahorro
 * y la lista de transacciones del usuario.
 */
@Data
public class AnalisisFinancieroRequestDTO {

    @NotNull(message = "El ingreso mensual es obligatorio")
    private BigDecimal ingresoMensual;

    @NotNull(message = "El nivel de endeudamiento es obligatorio")
    private Integer nivelEndeudamiento;

    @NotNull(message = "La frecuencia de ahorro es obligatoria")
    private String frecuenciaAhorro;

    private String monedaLocalUsuario = "COP";

    @NotEmpty(message = "Debe incluir al menos una transaccion")
    @Valid
    private List<TransaccionDTO> transacciones;
}
