# Arquitectura de la solución — Team 32 (Vinnah App)

> Documento de Arquitectura de Software y Decisiones de Diseño (ADR).

---

## 1. Decisión de Arquitectura

**Estado:** ✅ **Confirmada e Implementada por el equipo.**

Se adoptó un patrón de **Arquitectura de Microservicios Políglotas Desacoplados**, combinando las fortalezas de **Next.js** para la interfaz web, **Java / Spring Boot** para el backend transaccional y de seguridad, **Python / FastAPI** para el motor de inferencia de Machine Learning, y **Oracle Cloud Infrastructure (OCI)** para el almacenamiento en la nube.

```
┌────────────────────────────────────────────────────────┐
│                   Cliente Web (Navegador)              │
│                 Next.js 14 / React / Tailwind          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JSON (CORS)
                            ▼
┌────────────────────────────────────────────────────────┐
│        Backend Gateway (Java 17 / Spring Boot 3.4.1)   │
│   - Autenticación JWT Stateless & BCrypt               │
│   - Persistencia JPA (H2 Dev / PostgreSQL / Oracle)    │
│   - Orquestador WebClient hacia Inferencia             │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON Interno (:8001)
                            ▼
┌────────────────────────────────────────────────────────┐
│       Servicio de Inferencia (Python 3.11+ / FastAPI)  │
│   - Limpiador Regex de texto bancario                  │
│   - Clasificador NLP (TF-IDF + SGDClassifier 8 cats)   │
│   - Motor de Salud Financiera & Recomendaciones        │
│   - Carga masiva de extractos Excel/CSV                │
└───────────────────────────┬────────────────────────────┘
                            │ Descarga automática .pkl
                            ▼
┌────────────────────────────────────────────────────────┐
│       Oracle Cloud Infrastructure (OCI Object Storage) │
│   - Bucket: vinnah-models                              │
│   - Persistencia y versionado de modelo_ia.pkl         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Componentes del Sistema (Modelo C4 — Nivel 2: Contenedores)

| Componente | Tecnología | Puerto | Responsabilidad Principal |
| :--- | :--- | :---: | :--- |
| **Frontend Web** | Next.js 14, React, TailwindCSS, Recharts | `:3000` | Renderizado del Dashboard, gestión de transacciones y categorías, interfaz visual responsive y visualización de la mascota dinámica Vinnah. |
| **Backend Gateway** | Java 17/21, Spring Boot 3.4.1, Spring Security, JPA | `:8080` | Punto de entrada seguro, gestión de usuarios, validaciones Bean Validation, persistencia en BD y reenvío de peticiones a la IA. |
| **Servicio de Inferencia** | Python 3.11+, FastAPI, Scikit-Learn, Pandas | `:8001` | Clasificación de transacciones en 8 categorías oficiales, cálculo de riesgo crediticio, ratio de gasto y diagnóstico financiero. |
| **Cloud Storage** | OCI Object Storage | Cloud | Repositorio centralizado de artefactos de Machine Learning (`modelo_ia.pkl`) y datasets. |
| **Base de Datos** | H2 (Dev) / PostgreSQL / Oracle (Prod) | `:8080` / Cloud | Almacenamiento relacional de usuarios, credenciales y registros de transacciones procesadas. |

---

## 3. Servicio(s) OCI (Oracle Cloud Infrastructure)

**Estado:** ✅ **Confirmado y configurado en el proyecto.**

- [x] **Servicio OCI confirmado:** OCI Object Storage (Nivel *Always Free*).
- [x] **Bucket / recurso creado:** `vinnah-models` (Namespace: configurable vía `OCI_OS_NAMESPACE`).
- [x] **Región:** `sa-saopaulo-1` / `us-ashburn-1`.
- [x] **Credenciales y Seguridad:** 
  - Autenticación mediante par de claves RSA (`oci_api_key.pem` y `~/.oci/config` con permisos `chmod 600`).
  - Variables de entorno documentadas en `.env.example`.
  - Cero exposición de claves privadas en el repositorio Git (`.gitignore`).

---

## 4. Principios de Diseño Aplicados

1. **C4 Model:** Documentación visual estructurada en niveles de Contexto y Contenedores.
2. **The Twelve-Factor App:**
   - *Configuración desacoplada:* Gestión de parámetros vía variables de entorno (`.env`).
   - *Procesos sin estado (Stateless):* Sesiones gestionadas mediante tokens JWT sin almacenar estado en memoria de servidor.
   - *Paridad desarrollo/producción:* Uso de perfiles Maven/Spring (`application-dev.yml` con H2 en memoria para pruebas rápidas sin dependencias externas).
3. **OWASP REST Security:**
   - Validación estricta de esquemas de entrada (Pydantic en Python, Bean Validation `@Valid` en Java).
   - Sanitización de texto libre contra inyecciones y caracteres no imprimibles.
   - Hashing seguro de contraseñas con `BCryptPasswordEncoder`.
   - Control estricto de orígenes mediante políticas CORS en Spring Security.

---

## 5. Historial de Decisiones de Arquitectura (ADR)

| Fecha | Decisión de Arquitectura | Justificación / Impacto | Responsable |
| :---: | :--- | :--- | :---: |
| **24/07/2026** | Adopción de mono-repo políglota (Java + Python + Next.js). | Permite centralizar la colaboración de Frontend, Backend y Data Science manteniendo despliegues independientes. | Equipo |
| **26/07/2026** | Estandarización de 8 categorías oficiales de gastos y API FastAPI. | Permite clasificar transacciones homogéneamente y ofrecer inferencia en tiempo real (< 50ms) con Swagger UI. | Ruth / Natalia (Data Science) |
| **07/08/2026** | Integración Spring Boot Gateway ↔ FastAPI mediante `WebClient`. | Comunicación reactiva y no bloqueante para delegar la inferencia sin acoplar lógica de IA en Java. | Jaiver / Ruth / Natalia |
| **13/08/2026** | Inclusión de perfil H2 (`application-dev.yml`) en Spring Boot. | Permite levantar y probar el backend localmente sin necesidad de instalar Oracle o PostgreSQL. | Daniel |
| **14/08/2026** | Integración de OCI Object Storage para descarga dinámica de `.pkl`. | Desacopla los binarios pesados del repositorio Git y centraliza la distribución del modelo de IA en la nube. | Daniel |
| **14/08/2026** | Validación y pruebas de inferencia multiclase en API y Notebook. | Pruebas de integración del clasificador financiero con transacciones y ajustes en notebook. | Natalia / Ruth (Data Science) |
| **14/08/2026** | Habilitación de CORS y conexión completa Frontend Next.js ↔ Backend. | Permite la comunicación fluida del cliente web con los endpoints protegidos de Spring Boot. | Daniel |
