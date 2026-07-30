package financial_analysis_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Credenciales para iniciar sesion.
 */
@Data
public class LoginRequestDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    private String password;
}
