package financial_analysis_api.controller;

import financial_analysis_api.dto.ImportacionCsvResponseDTO;
import financial_analysis_api.service.ImportacionCsvService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Endpoint para importar transacciones desde un archivo CSV.
 * Parsea el archivo, clasifica via Python y devuelve estadisticas + clasificaciones.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ImportacionCsvController {

    private final ImportacionCsvService importacionService;

    @PostMapping("/transacciones/importar-csv")
    public ResponseEntity<ImportacionCsvResponseDTO> importar(
            @RequestParam("archivo") MultipartFile archivo,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(importacionService.importar(archivo, email));
    }
}
