# Requisitos funcionales y no funcionales — Team 32

> Extraído del Documento Maestro del Proyecto, sección 6. Documento vivo: actualizar aquí cualquier cambio de alcance.

## Requisitos funcionales (brief oficial)

| ID | Requisito | Estado |
|---|---|---|
| FR-01 | Clasificar automáticamente transacciones en categorías (Alimentación, Transporte, Salud, Vivienda, Educación, Ocio, Servicios, otras). | ✅ Completado (Data Science NLP) |
| FR-02 | Generar una evaluación del perfil financiero del usuario (ej.: Saludable / En observación / En riesgo). | ✅ Completado (Motor Experto) |
| FR-03 | Generar recomendaciones simples y objetivas basadas en los resultados. | ✅ Completado (Motor Experto) |
| FR-04 | Exponer `POST /analisis-financiero` (ingreso, endeudamiento, ahorro, transacciones) → perfil, probabilidad, resumen, recomendaciones. | ✅ Completado (FastAPI Microservicio) |
| FR-05 | Validar los datos de entrada y manejar errores de forma explícita. | ✅ Completado (Pydantic / FastAPI) |
| FR-06 | Documentar todos los endpoints (OpenAPI/Swagger). | ✅ Completado (Swagger /docs) |
| FR-07 | Cargar y usar un modelo entrenado y serializado desde el backend. | ✅ Completado (modelo_ia.pkl) |
| FR-08 | Alertar sobre gastos elevados. | ✅ Completado (Motor Experto) |
| FR-09 | Presentar como mínimo tres ejemplos reales de uso de la API. | ⬜ Pendiente (Demo) |
| FR-10 | Realizar un CRUD de los ingresos y gastos. ⬜ Pendiente |  

## Requisitos no funcionales (propuestos — marco ISO/IEC 25010)

| Característica | NFR |
|---|---|
| Eficiencia de desempeño | Respuesta de la API < 2 s (p95) para una solicitud individual. |
| Compatibilidad | Consumir/producir JSON válido (`Content-Type: application/json`). |
| Usabilidad | Errores de validación con mensajes claros y códigos HTTP correctos. |
| Confiabilidad / Disponibilidad | Manejar entradas incompletas sin caerse. |
| Seguridad | Validar/sanitizar toda entrada en servidor (OWASP REST Security Cheat Sheet); no loguear datos financieros sensibles. |
| Mantenibilidad | Código modular; arquitectura documentada. |
| Portabilidad | Backend y microservicio de inferencia deben poder correr en Docker. |

## Clasificación MoSCoW

| Prioridad | Ítems |
|---|---|
| Must have | FR-01 a FR-09, integración con 1 servicio OCI, alertas de gastos elevados. |
| Should have | Dashboard financiero simple, historial de análisis. |
| Could have | Batch CSV, exportación de informes, Docker, pruebas automatizadas, explicabilidad de modelos, captura por imagen/PDF/cámara (OCR). |
| Won't have (esta edición) | Autenticación multi-tenant, app móvil nativa, integración bancaria real (Open Banking). |

## ⚠ Pendientes de decisión del equipo

- [ ] Confirmar si "Alertas de gastos elevados" (FR-08) es obligatoria o stretch (ver Documento Maestro, sección 5.2).
- [ ] Confirmar contrato final de la API (Versión A vs Versión B, ver Documento Maestro, sección 16.1).
