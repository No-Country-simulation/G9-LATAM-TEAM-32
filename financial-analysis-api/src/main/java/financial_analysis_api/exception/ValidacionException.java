package financial_analysis_api.exception;

/**
 * Se lanza cuando los datos de entrada no pasan la validacion de negocio.
 */
public class ValidacionException extends RuntimeException {
    public ValidacionException(String message) {
        super(message);
    }
}
