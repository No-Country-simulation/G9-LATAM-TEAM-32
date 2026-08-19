# Requisitos funcionales y no funcionales — Team 32 (Vinnah App)

> Matriz de Requisitos del Sistema y Cobertura de Alcance (MVP).

---

## Requisitos funcionales (brief oficial)

| ID | Requisito | Estado | Evidencia en el Código |
|---|---|:---:|---|
| **FR-01** | Clasificar automáticamente transacciones en categorías (Alimentación, Transporte, Salud, Vivienda, Educación, Ocio, Servicios, Obligaciones). | ✅ **Completado** | Pipeline NLP TF-IDF + SGDClassifier en `data-science/` y FastAPI. |
| **FR-02** | Generar una evaluación del perfil financiero del usuario (Saludable / En observación / En riesgo). | ✅ **Completado** | Motor de scoring multideuda en `/predict`. |
| **FR-03** | Generar recomendaciones simples y objetivas basadas en los resultados. | ✅ **Completado** | Motor de reglas contextuales y consejos financieros. |
| **FR-04** | Exponer `POST /predict` o `/analisis-financiero` con datos completos. | ✅ **Completado** | Endpoint REST expuesto en FastAPI y Spring Boot. |
| **FR-05** | Validar los datos de entrada y manejar errores de forma explícita. | ✅ **Completado** | Validaciones Pydantic y Bean Validation `@Valid`. |
| **FR-06** | Documentar todos los endpoints (OpenAPI/Swagger). | ✅ **Completado** | Swagger UI disponible en `/docs` y `/swagger-ui/index.html`. |
| **FR-07** | Cargar y usar un modelo entrenado y serializado desde el backend. | ✅ **Completado** | Carga dinámica de `modelo_ia.pkl` local y desde OCI Bucket. |
| **FR-08** | Alertar sobre gastos elevados y sobreendeudamiento. | ✅ **Completado** | Detección automática por ratios porcentuales de gasto/ingreso. |
| **FR-09** | Presentar como mínimo tres ejemplos reales de uso de la API. | ✅ **Completado** | Pruebas documentadas en Swagger y endpoint `/analizar-excel`. |
| **FR-10** | Realizar un CRUD / Gestión de los ingresos y gastos. | ✅ **Completado** | Gestión visual interactiva en Frontend Next.js. |

---

## Requisitos no funcionales (Marco ISO/IEC 25010)

| Característica | Requisito No Funcional (NFR) | Estado |
|---|---|:---:|
| **Eficiencia de desempeño** | Respuesta de la API < 500 ms para inferencia individual de texto. | ✅ Cumplido |
| **Compatibilidad** | Consumo y producción estricta de JSON válido (`Content-Type: application/json`). | ✅ Cumplido |
| **Usabilidad** | Mensajes de error claros con códigos HTTP estándar (400, 404, 500). | ✅ Cumplido |
| **Confiabilidad** | Manejo de entradas incompletas con valores fallback y normalización Regex. | ✅ Cumplido |
| **Seguridad** | Autenticación JWT stateless, BCrypt para contraseñas y políticas CORS estrictas. | ✅ Cumplido |
| **Mantenibilidad** | Arquitectura modular desacoplada en mono-repo con documentación técnica. | ✅ Cumplido |
| **Portabilidad** | Compatibilidad multiplataforma mediante entornos virtuales Python y Maven Wrapper. | ✅ Cumplido |

---

## Clasificación MoSCoW

| Prioridad | Ítems |
|---|---|
| **Must have** | FR-01 a FR-10, integración con OCI Object Storage, alertas financieras y Swagger UI. |
| **Should have** | Dashboard financiero interactivo, mascota con estados de ánimo, carga masiva Excel/CSV. |
| **Could have (Roadmap v2)** | Dockerización, soporte multi-tenant, exportación de reportes en PDF, explicabilidad de modelos (SHAP). |
| **Won't have (esta edición)** | Integración bancaria directa con Open Banking en vivo. |
