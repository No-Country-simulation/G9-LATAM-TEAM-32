# Arquitectura de la solución — Team 32

> Extraído del Documento Maestro del Proyecto, sección 8. Documento vivo.

## Decisión de arquitectura

**Estado: ⚠ pendiente de confirmación formal por el equipo (Software Engineer: Guido).**

Propuesta: arquitectura desacoplada (microservicios poliglotas Java + Python).

```
Cliente ── HTTPS/JSON ──► Backend Gateway (Java + Spring Boot)
                                 │  REST interno
                                 ▼
                    Servicio de Inferencia (Python / FastAPI)
                                 │
                                 ▼
                 OCI Object Storage (modelo serializado + datasets)
```

- **Backend Gateway (Java/Spring Boot):** valida entrada, aplica reglas de negocio (alertas, recomendaciones), expone la API pública documentada.
- **Servicio de Inferencia (Python/FastAPI):** carga el modelo serializado (`.pkl`/`.joblib`) y expone un endpoint interno de predicción.
- **OCI Object Storage:** almacena el modelo entrenado y los datasets.

## Servicio(s) OCI

**Estado: ⚠ pendiente de confirmación — se recomienda Object Storage** (nivel Always Free, baja curva de aprendizaje, ideal para modelos serializados y datasets).

- [ ] Servicio OCI confirmado: ______________________
- [ ] Bucket / recurso creado: ______________________
- [ ] Credenciales configuradas (¡nunca commitear claves! usar variables de entorno o OCI Vault)

## Principios de diseño aplicados

- **C4 Model** para documentar (niveles Contexto y Contenedores).
- **The Twelve-Factor App**: configuración externa por variables de entorno, procesos sin estado, logs como flujo de eventos.
- **OWASP REST Security Cheat Sheet**: validación de entrada del lado servidor, tipado fuerte, rechazo de `Content-Type` inesperado.

## Historial de decisiones

| Fecha | Decisión | Quién |
|---|---|---|
| | | |
