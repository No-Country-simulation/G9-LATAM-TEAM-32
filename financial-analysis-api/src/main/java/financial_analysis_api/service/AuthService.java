package financial_analysis_api.service;

import financial_analysis_api.dto.AuthResponseDTO;
import financial_analysis_api.dto.LoginRequestDTO;
import financial_analysis_api.dto.RegistroRequestDTO;

/**
 * Servicio de autenticacion. Maneja registro de usuarios y login con JWT.
 */
public interface AuthService {

    AuthResponseDTO registrar(RegistroRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);
}
