package financial_analysis_api.service;

import financial_analysis_api.client.ModeloClasificacionClient;
import financial_analysis_api.dto.CategoriaAsignadaDTO;
import financial_analysis_api.dto.ClasificacionTransaccionRequestDTO;
import financial_analysis_api.dto.ClasificacionTransaccionResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementacion de ClasificacionTransaccionService.
 * Reenvia las transacciones al modelo Python y devuelve las categorias asignadas.
 */
@Service
@RequiredArgsConstructor
public class ClasificacionTransaccionServiceImpl implements ClasificacionTransaccionService {

    private final ModeloClasificacionClient modeloClient;

    @Override
    public ClasificacionTransaccionResponseDTO clasificar(ClasificacionTransaccionRequestDTO request) {
        List<CategoriaAsignadaDTO> clasificaciones = modeloClient.clasificarTransacciones(request.getTransacciones());

        ClasificacionTransaccionResponseDTO response = new ClasificacionTransaccionResponseDTO();
        response.setClasificaciones(clasificaciones);
        return response;
    }
}
