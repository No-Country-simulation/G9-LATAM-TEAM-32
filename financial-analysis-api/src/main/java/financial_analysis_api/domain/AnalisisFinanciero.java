package financial_analysis_api.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persiste el resultado de cada analisis financiero solicitado por un usuario.
 * Los campos resumenGastos y recomendaciones se almacenan como JSON serializado.
 */
@Data
@Entity
@Table(name = "analisis_financieros")
public class AnalisisFinanciero {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID usuarioId;

    @Column(nullable = false)
    private BigDecimal ingresoMensual;

    @Column(nullable = false)
    private Integer nivelEndeudamiento;

    @Column(nullable = false)
    private String frecuenciaAhorro;

    private String perfilFinanciero;

    private Double probabilidad;

    @Column(columnDefinition = "TEXT")
    private String resumenGastos;

    @Column(columnDefinition = "TEXT")
    private String recomendaciones;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAnalisis;

    @PrePersist
    void prePersist() {
        this.fechaAnalisis = LocalDateTime.now();
    }
}
