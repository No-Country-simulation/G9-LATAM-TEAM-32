package financial_analysis_api.client;

import financial_analysis_api.dto.*;
import financial_analysis_api.exception.ModeloClasificacionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Implementacion REST del cliente que llama al servicio Python en localhost:8001.
 * Usa WebClient (webflux) para las peticiones HTTP al modelo de ML.
 */
@Component
public class ModeloClasificacionRestClientImpl implements ModeloClasificacionClient {

    private final WebClient webClient;

    public ModeloClasificacionRestClientImpl(WebClient.Builder webClientBuilder,
                                             @Value("${python.service.url}") String pythonUrl) {
        this.webClient = webClientBuilder.baseUrl(pythonUrl).build();
    }

    @Override
    public AnalisisFinancieroResponseDTO analizarFinanzas(AnalisisFinancieroRequestDTO request) {
        try {
            return webClient.post()
                    .uri("/analisis-financiero")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AnalisisFinancieroResponseDTO.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new ModeloClasificacionException(
                    "Error al conectar con el servicio de analisis financiero: "
                            + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new ModeloClasificacionException("Error al conectar con el servicio de analisis financiero: " + e.getMessage());
        }
    }

    @Override
    public List<CategoriaAsignadaDTO> clasificarTransacciones(List<TransaccionDTO> transacciones) {
        try {
            return webClient.post()
                    .uri("/clasificacion-transacciones")
                    .bodyValue(Map.of("transacciones", transacciones))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<CategoriaAsignadaDTO>>() {})
                    .block();
        } catch (Exception e) {
            throw new ModeloClasificacionException("Error al conectar con el servicio de clasificacion: " + e.getMessage());
        }
    }
}