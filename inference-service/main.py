"""
Microservicio de inferencia — Team 32
Carga el modelo serializado por Ciencia de Datos y expone un endpoint
interno de predicción, consumido por el Backend Gateway (Spring Boot).

Ver docs/arquitectura.md para el contexto de esta decisión.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Servicio de Inferencia Financiera", version="0.1.0")

# TODO: reemplazar por la carga real del modelo serializado, ej.:
# import joblib
# modelo = joblib.load("../data-science/models/modelo_perfil_financiero.joblib")


class Transaccion(BaseModel):
    descripcion: str
    valor: float


class SolicitudAnalisis(BaseModel):
    ingreso_mensual: float
    nivel_endeudamiento: float
    frecuencia_ahorro: str
    transacciones: list[Transaccion]


@app.get("/health")
def health():
    """Health check — usado por el Backend Gateway para verificar disponibilidad."""
    return {"status": "ok"}


@app.post("/predict")
def predict(solicitud: SolicitudAnalisis):
    """
    Endpoint interno de inferencia. Reemplazar el cuerpo por la llamada
    real al modelo entrenado (ver FR-01 a FR-04 en docs/requisitos.md).
    """
    # TODO: implementar clasificación de gastos + perfil financiero real
    return {
        "perfil_financiero": "PENDIENTE_DE_IMPLEMENTAR",
        "probabilidad": None,
        "resumen_gastos": {},
        "recomendaciones": [],
    }
