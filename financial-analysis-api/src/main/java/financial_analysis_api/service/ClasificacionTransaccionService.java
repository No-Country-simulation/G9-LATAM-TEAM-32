package financial_analysis_api.service;

import financial_analysis_api.dto.ClasificacionTransaccionRequestDTO;
import financial_analysis_api.dto.ClasificacionTransaccionResponseDTO;

/**
 * Servicio de clasificacion de transacciones. Envia descripciones al modelo Python
 * y devuelve cada transaccion con su categoria asignada.
 */
public interface ClasificacionTransaccionService {

    ClasificacionTransaccionResponseDTO clasificar(ClasificacionTransaccionRequestDTO request);
}
