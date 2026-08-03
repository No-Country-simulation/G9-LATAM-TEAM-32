package financial_analysis_api.exception;

/**
 * Se lanza cuando el archivo CSV subido tiene formato invalido o esta vacio.
 */
public class ArchivoCsvInvalidoException extends RuntimeException {
    public ArchivoCsvInvalidoException(String message) {
        super(message);
    }
}
