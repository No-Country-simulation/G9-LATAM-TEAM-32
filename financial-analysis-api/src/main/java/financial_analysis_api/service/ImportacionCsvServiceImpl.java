package financial_analysis_api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import financial_analysis_api.client.ModeloClasificacionClient;
import financial_analysis_api.domain.ImportacionCsv;
import financial_analysis_api.domain.Usuario;
import financial_analysis_api.dto.CategoriaAsignadaDTO;
import financial_analysis_api.dto.ImportacionCsvResponseDTO;
import financial_analysis_api.dto.TransaccionDTO;
import financial_analysis_api.exception.ArchivoCsvInvalidoException;
import financial_analysis_api.exception.ValidacionException;
import financial_analysis_api.repository.ImportacionCsvRepository;
import financial_analysis_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementacion de ImportacionCsvService.
 * Parsea el CSV linea a linea (descripcion,valor), clasifica via Python
 * y persiste las estadisticas + resultado en BD.
 */
@Service
@RequiredArgsConstructor
public class ImportacionCsvServiceImpl implements ImportacionCsvService {

    private final ModeloClasificacionClient modeloClient;
    private final ImportacionCsvRepository importacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    @Override
    public ImportacionCsvResponseDTO importar(MultipartFile archivo, String emailUsuario) {
        if (archivo.isEmpty()) {
            throw new ArchivoCsvInvalidoException("El archivo CSV esta vacio");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ValidacionException("Usuario no encontrado"));

        List<TransaccionDTO> validas = new ArrayList<>();
        int totalFilas = 0;
        int filasError = 0;

        // Parsear CSV: formato esperado -> descripcion,valor,tipoDivisa
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(archivo.getInputStream()))) {
            String linea;
            boolean primeraLinea = true;
            while ((linea = reader.readLine()) != null) {
                if (primeraLinea) {
                    primeraLinea = false; // ponytail: skip header, asume que siempre hay encabezado
                    continue;
                }
                totalFilas++;
                try {
                    String[] campos = linea.split(",");
                    if (campos.length < 2) throw new IllegalArgumentException("Faltan campos");

                    TransaccionDTO dto = new TransaccionDTO();
                    dto.setDescripcion(campos[0].trim());
                    dto.setValor(new BigDecimal(campos[1].trim()));
                    dto.setTipoDivisa(campos.length >= 3 ? campos[2].trim() : "PEN");
                    validas.add(dto);
                } catch (Exception e) {
                    filasError++;
                }
            }
        } catch (ArchivoCsvInvalidoException e) {
            throw e;
        } catch (Exception e) {
            throw new ArchivoCsvInvalidoException("Error al leer el archivo CSV: " + e.getMessage());
        }

        if (validas.isEmpty()) {
            throw new ArchivoCsvInvalidoException("No se encontraron transacciones validas en el CSV");
        }

        // Clasificar via Python
        List<CategoriaAsignadaDTO> clasificaciones = modeloClient.clasificarTransacciones(validas);

        // Persistir
        ImportacionCsv entity = new ImportacionCsv();
        entity.setUsuarioId(usuario.getId());
        entity.setNombreArchivo(archivo.getOriginalFilename());
        entity.setTotalFilas(totalFilas);
        entity.setFilasValidas(validas.size());
        entity.setFilasError(filasError);

        try {
            entity.setResultadoClasificacion(objectMapper.writeValueAsString(clasificaciones));
        } catch (JsonProcessingException e) {
            throw new ValidacionException("Error al serializar clasificaciones");
        }

        importacionRepository.save(entity);

        // Respuesta
        ImportacionCsvResponseDTO response = new ImportacionCsvResponseDTO();
        response.setTotalFilas(totalFilas);
        response.setFilasValidas(validas.size());
        response.setFilasError(filasError);
        response.setClasificaciones(clasificaciones);
        return response;
    }
}
