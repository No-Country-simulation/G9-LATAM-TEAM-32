package financial_analysis_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import financial_analysis_api.client.ModeloClasificacionClient;
import financial_analysis_api.domain.AnalisisFinanciero;
import financial_analysis_api.domain.Usuario;
import financial_analysis_api.dto.AnalisisFinancieroRequestDTO;
import financial_analysis_api.dto.AnalisisFinancieroResponseDTO;
import financial_analysis_api.exception.ValidacionException;
import financial_analysis_api.repository.AnalisisFinancieroRepository;
import financial_analysis_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Implementacion de AnalisisFinancieroService.
 * Valida la entrada, llama al modelo Python, persiste el resultado en BD y lo retorna.
 * No contiene logica de calculo propia — toda la inteligencia esta en Python.
 */
@Service
@RequiredArgsConstructor
public class AnalisisFinancieroServiceImpl implements AnalisisFinancieroService {

    private final ModeloClasificacionClient modeloClient;
    private final AnalisisFinancieroRepository analisisRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    @Override
    public AnalisisFinancieroResponseDTO analizar(AnalisisFinancieroRequestDTO request, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ValidacionException("Usuario no encontrado"));

        // Delegar al modelo Python
        AnalisisFinancieroResponseDTO respuesta = modeloClient.analizarFinanzas(request);

        // Persistir resultado
        AnalisisFinanciero entity = new AnalisisFinanciero();
        entity.setUsuarioId(usuario.getId());
        entity.setIngresoMensual(request.getIngresoMensual());
        entity.setNivelEndeudamiento(request.getNivelEndeudamiento());
        entity.setFrecuenciaAhorro(request.getFrecuenciaAhorro());
        entity.setPerfilFinanciero(respuesta.getPerfilFinanciero());
        entity.setProbabilidad(respuesta.getProbabilidad());

        try {
            entity.setResumenGastos(objectMapper.writeValueAsString(respuesta.getResumenGastos()));
            entity.setRecomendaciones(objectMapper.writeValueAsString(respuesta.getRecomendaciones()));
        } catch (JsonProcessingException e) {
            throw new ValidacionException("Error al serializar resultado del analisis");
        }

        analisisRepository.save(entity);
        return respuesta;
    }
}
