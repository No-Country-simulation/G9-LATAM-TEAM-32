package financial_analysis_api.controller;

import financial_analysis_api.dto.ClasificacionTransaccionRequestDTO;
import financial_analysis_api.dto.ClasificacionTransaccionResponseDTO;
import financial_analysis_api.service.ClasificacionTransaccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de clasificacion de transacciones. Recibe descripciones de gastos
 * y devuelve cada una con su categoria asignada por el modelo Python.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ClasificacionTransaccionController {

    private final ClasificacionTransaccionService clasificacionService;

    @PostMapping("/clasificacion-transacciones")
    public ResponseEntity<ClasificacionTransaccionResponseDTO> clasificar(
            @Valid @RequestBody ClasificacionTransaccionRequestDTO request) {
        return ResponseEntity.ok(clasificacionService.clasificar(request));
    }
}
