package financial_analysis_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Representa una transaccion individual con descripcion y valor monetario.
 * Se usa como entrada tanto en analisis financiero como en clasificacion.
 */
@Data
public class TransaccionDTO {

    @NotBlank(message = "La descripcion es obligatoria")
    private String descripcion;

    @NotNull(message = "El valor es obligatorio")
    private BigDecimal valor;

    @NotNull(message = "El tipo de divisa debe ser obligatoria")
    private String tipoDivisa;
}
