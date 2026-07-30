package financial_analysis_api.client;

import financial_analysis_api.dto.AnalisisFinancieroRequestDTO;
import financial_analysis_api.dto.AnalisisFinancieroResponseDTO;
import financial_analysis_api.dto.CategoriaAsignadaDTO;
import financial_analysis_api.dto.TransaccionDTO;

import java.util.List;

/**
 * Interfaz del cliente que se comunica con el servicio de Python (modelo de ML).
 * Dos operaciones: analisis financiero completo y clasificacion de transacciones.
 */
public interface ModeloClasificacionClient {

    AnalisisFinancieroResponseDTO analizarFinanzas(AnalisisFinancieroRequestDTO request);

    List<CategoriaAsignadaDTO> clasificarTransacciones(List<TransaccionDTO> transacciones);
}
