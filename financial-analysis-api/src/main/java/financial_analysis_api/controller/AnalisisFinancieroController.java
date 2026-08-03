package financial_analysis_api.controller;

import financial_analysis_api.dto.AnalisisFinancieroRequestDTO;
import financial_analysis_api.dto.AnalisisFinancieroResponseDTO;
import financial_analysis_api.service.AnalisisFinancieroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de analisis financiero. Recibe datos del usuario y transacciones,
 * los envia al modelo Python y retorna perfil financiero + recomendaciones.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalisisFinancieroController {

    private final AnalisisFinancieroService analisisService;

    @PostMapping("/analisis-financiero")
    public ResponseEntity<AnalisisFinancieroResponseDTO> analizar(
            @Valid @RequestBody AnalisisFinancieroRequestDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(analisisService.analizar(request, email));
    }
}
