CREATE TABLE usuarios (
    id              UUID PRIMARY KEY,
    nombre          VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    fecha_registro  TIMESTAMP NOT NULL
);

CREATE TABLE analisis_financieros (
    id                    UUID PRIMARY KEY,
    usuario_id            UUID NOT NULL REFERENCES usuarios(id),
    ingreso_mensual       NUMERIC(15,2) NOT NULL,
    nivel_endeudamiento   INTEGER NOT NULL,
    frecuencia_ahorro     VARCHAR(255) NOT NULL,
    perfil_financiero     VARCHAR(255),
    probabilidad          DOUBLE PRECISION,
    resumen_gastos        TEXT,
    recomendaciones       TEXT,
    fecha_analisis        TIMESTAMP NOT NULL
);

CREATE TABLE importaciones_csv (
    id                        UUID PRIMARY KEY,
    usuario_id                UUID NOT NULL REFERENCES usuarios(id),
    nombre_archivo            VARCHAR(255) NOT NULL,
    total_filas               INTEGER NOT NULL,
    filas_validas             INTEGER NOT NULL,
    filas_error               INTEGER NOT NULL,
    resultado_clasificacion   TEXT,
    fecha                     TIMESTAMP NOT NULL
);