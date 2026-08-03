package financial_analysis_api.service;

import financial_analysis_api.dto.AnalisisFinancieroRequestDTO;
import financial_analysis_api.dto.AnalisisFinancieroResponseDTO;

/**
 * Servicio de analisis financiero. Valida entrada, delega al modelo Python y persiste resultados.
 */
public interface AnalisisFinancieroService {

    AnalisisFinancieroResponseDTO analizar(AnalisisFinancieroRequestDTO request, String emailUsuario);
}
