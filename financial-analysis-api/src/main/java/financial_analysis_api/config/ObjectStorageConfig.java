package financial_analysis_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

/**
 * Configuracion de OCI Object Storage. Almacena namespace, bucket y region
 * para uso futuro (ej: guardar CSVs originales en la nube).
 */
@Configuration
@Getter
public class ObjectStorageConfig {

    @Value("${oci.object-storage.namespace:#{null}}")
    private String namespace;

    @Value("${oci.object-storage.bucket:#{null}}")
    private String bucket;

    @Value("${oci.object-storage.region:#{null}}")
    private String region;
}
