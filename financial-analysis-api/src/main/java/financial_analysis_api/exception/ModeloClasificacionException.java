package financial_analysis_api.exception;

/**
 * Se lanza cuando falla la comunicacion con el servicio Python de clasificacion.
 */
public class ModeloClasificacionException extends RuntimeException {
    public ModeloClasificacionException(String message) {
        super(message);
    }
}
