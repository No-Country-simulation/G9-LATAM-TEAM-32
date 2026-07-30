# Backend — API REST (Java + Spring Boot)

Esta carpeta debe contener el proyecto Spring Boot generado con [Spring Initializr](https://start.spring.io/).

## Cómo generarlo

1. Ir a https://start.spring.io/
2. Configurar:
   - Project: Maven
   - Language: Java
   - Spring Boot: última versión estable
   - Group: `com.team32`
   - Artifact: `analisis-financiero`
   - Dependencies: **Spring Web**, **Validation**, **Spring Boot Actuator**, **Spring Boot DevTools**
3. Descargar el `.zip`, descomprimirlo, y mover su contenido **dentro de esta carpeta** (`backend/`), reemplazando este README si es necesario (o dejándolo como referencia en `docs/`).

## Endpoints a implementar (ver `docs/requisitos.md`)

- `POST /analisis-financiero` (FR-04)
- `GET /health` o usar el de Actuator (`/actuator/health`)

## Integración con el microservicio de inferencia

El backend debe llamar internamente al servicio en `inference-service/` (ver `docs/arquitectura.md`) usando `RestTemplate` o `WebClient`, aplicando validación de entrada (FR-05) antes de reenviar la solicitud.

## Cómo correr

```bash
./mvnw spring-boot:run
```
