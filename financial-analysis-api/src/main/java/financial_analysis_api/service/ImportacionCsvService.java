package financial_analysis_api.service;

import financial_analysis_api.dto.ImportacionCsvResponseDTO;
import org.springframework.web.multipart.MultipartFile;

/**
 * Servicio de importacion CSV. Parsea el archivo, clasifica transacciones via Python
 * y persiste el resultado agregado.
 */
public interface ImportacionCsvService {

    ImportacionCsvResponseDTO importar(MultipartFile archivo, String emailUsuario);
}
