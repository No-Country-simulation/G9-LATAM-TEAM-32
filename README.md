# Análisis Financiero Inteligente — Hackathon ONE G9 LATAM (Team 32)

> Fintech / Educación Financiera / Billeteras Digitales · Alura + Oracle · NoCountry

Solución que analiza el comportamiento financiero de un usuario a partir de sus transacciones, clasifica automáticamente sus gastos, determina su perfil financiero y devuelve recomendaciones personalizadas vía API REST, usando Ciencia de Datos (Python/Scikit-Learn), un backend en Java/Spring Boot y al menos un servicio de Oracle Cloud Infrastructure (OCI).

📄 Documento maestro completo del proyecto: [`docs/`](./docs) · Estado de requisitos: [`docs/requisitos.md`](./docs/requisitos.md) · Arquitectura: [`docs/arquitectura.md`](./docs/arquitectura.md) · Cronograma: [`docs/cronograma.md`](./docs/cronograma.md)

## Equipo

| Nombre | Rol |
|---|---|
| Vivian Herrera Ardila | Project Manager |
| Jaiver Andrey Manso Osorio | Backend Developer |
| Bastian Muñoz | Backend Developer |
| Samuel Guevara | Data Scientist |
| Ruth Pacheco | Data Scientist |
| natalia maria diaz | Data |
| Guido Andres Serniotti | Software Engineer |
| Yoshua Daniel Castañeda Robles | Full Stack Developer |

## Arquitectura (resumen)

```
Cliente ── HTTPS/JSON ──► Backend Gateway (Java + Spring Boot)
                                 │  REST interno
                                 ▼
                    Servicio de Inferencia (Python / FastAPI)
                                 │
                                 ▼
                 OCI Object Storage (modelo serializado + datasets)
```

Detalle completo y justificación en [`docs/arquitectura.md`](./docs/arquitectura.md).

## Estructura del repositorio

```
data-science/        Notebooks, datos, features y modelo (Python/Pandas/Scikit-Learn)
inference-service/    Microservicio Python que sirve el modelo serializado
backend/              API REST pública (Java/Spring Boot)
infra/                 Scripts y notas de aprovisionamiento OCI
docs/                  Documentación viva del proyecto (requisitos, arquitectura, cronograma, herramientas, enlaces)
```

## Cómo ejecutar en local

```bash
# 1. Ciencia de Datos
cd data-science && pip install -r requirements.txt
jupyter notebook notebooks/

# 2. Microservicio de inferencia (Python / FastAPI)
cd inference-service
source .venv/bin/activate  # (o activate.fish en Fish Shell)
uvicorn main:app --reload --port 8001

# 3. Backend (Spring Boot)
cd backend && ./mvnw spring-boot:run
```

> 📌 **Nota para el revisor / evaluador:**  
> La documentación e interfaz interactiva Swagger UI se encuentra en `http://localhost:8001/docs`. Para probar la API desde el navegador, **primero debes encender el microservicio en la terminal** con el comando `uvicorn main:app --reload --port 8001`. Si el servidor no está encendido en la terminal, la página dirá *"No se puede conectar"*.


## Ejemplo de uso de la API

```json
POST /analisis-financiero
{
  "ingreso_mensual": 4500,
  "nivel_endeudamiento": 25,
  "frecuencia_ahorro": "Media",
  "transacciones": [
    { "descripcion": "Supermercado", "valor": 420 },
    { "descripcion": "Combustible", "valor": 300 },
    { "descripcion": "Streaming", "valor": 40 }
  ]
}
```

```json
{
  "perfil_financiero": "En observación",
  "probabilidad": 0.82,
  "resumen_gastos": { "alimentacion": 420, "transporte": 300, "entretenimiento": 40 },
  "recomendaciones": [
    "Monitorear los gastos recurrentes de entretenimiento",
    "Aumentar la reserva financiera mensual"
  ]
}
```

## Estado del MVP

- [x] Notebook con EDA, ingeniería de atributos y modelos
- [x] API REST con endpoints de clasificación de gastos
- [x] Clasificación de perfil financiero
- [x] Recomendaciones personalizadas en JSON
- [x] Alertas de gastos elevados
- [ ] Integración con al menos un servicio OCI


## Video demo

_(enlace pendiente — Tarea 2 de los entregables obligatorios)_

## Licencia

Este proyecto usa la licencia MIT (ver [`LICENSE`](./LICENSE)) — recomendada para proyectos abiertos de hackathon.
