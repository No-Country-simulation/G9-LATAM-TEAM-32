package financial_analysis_api.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Registro de cada importacion de CSV. Guarda estadisticas del parseo
 * y el resultado de clasificacion como JSON serializado.
 */
@Data
@Entity
@Table(name = "importaciones_csv")
public class ImportacionCsv {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID usuarioId;

    @Column(nullable = false)
    private String nombreArchivo;

    @Column(nullable = false)
    private Integer totalFilas;

    @Column(nullable = false)
    private Integer filasValidas;

    @Column(nullable = false)
    private Integer filasError;

    @Column(columnDefinition = "CLOB")
    private String resultadoClasificacion;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @PrePersist
    void prePersist() {
        this.fecha = LocalDateTime.now();
    }
}
