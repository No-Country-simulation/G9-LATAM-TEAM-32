package financial_analysis_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Respuesta de autenticacion con el token JWT y su tipo (Bearer).
 */
@Data
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String tipo;
}
