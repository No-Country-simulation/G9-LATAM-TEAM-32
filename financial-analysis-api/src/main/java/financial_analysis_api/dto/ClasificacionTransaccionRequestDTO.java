package financial_analysis_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Entrada para clasificar transacciones por categoria de gasto.
 * Recibe una lista de transacciones y las envia al modelo de Python.
 */
@Data
public class ClasificacionTransaccionRequestDTO {

    @NotEmpty(message = "Debe incluir al menos una transaccion")
    @Valid
    private List<TransaccionDTO> transacciones;
}
