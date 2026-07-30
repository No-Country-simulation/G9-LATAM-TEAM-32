package financial_analysis_api.exception;

/**
 * Se lanza cuando el email o password son incorrectos en el login.
 */
public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException(String message) {
        super(message);
    }
}
