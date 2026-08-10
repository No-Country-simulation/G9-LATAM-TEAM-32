"""
Microservicio de inferencia — Team 32
Carga el modelo serializado por Ciencia de Datos y expone un endpoint
interno de predicción, consumido por el Backend Gateway (Spring Boot).

Ver docs/arquitectura.md para el contexto de esta decisión.
"""

from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import os
from pathlib import Path
import joblib
import re

app = FastAPI(title="Servicio de Inferencia Financiera", version="0.1.0")

# 1. Rutas
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = (
    BASE_DIR.parent / "data-science" / "models" / "modelo_clasificador_gastos.pkl"
)

# 2. Carga del modelo
modelo = None
try:
    if os.path.exists(MODEL_PATH):
        modelo = joblib.load(MODEL_PATH)
        print("✅ Modelo cargado exitosamente.")
    else:
        print(f"⚠️ No se encontró el archivo en: {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Error al abrir el archivo .pkl: {e}")


# 3. Función de limpieza de extractos bancarios
def limpiar_extracto(texto: str) -> str:
    texto = texto.lower()
    prefijos = [
        r'\bcompra en\b', r'\bcompra pos\b', r'\bdebito automatico\b', 
        r'\btransf de\b', r'\btransf a\b', r'\bmp\*\b', r'\bpago mis cuentas\b'
    ]
    for p in prefijos:
        texto = re.sub(p, '', texto)
    texto = re.sub(r'\b\d{4,}\b', '', texto)  # Elimina IDs largos o números de terminal
    texto = re.sub(r'[^\w\s]', ' ', texto)   # Elimina caracteres especiales
    return re.sub(r'\s+', ' ', texto).strip()


# 4. Reglas fijas para comercios/marcas conocidas (Capa 1)
REGLAS_FIJAS = {
    'transporte': ['ypf', 'shell', 'axion', 'puma', 'estacion de servicio', 'uber', 'cabify'],
    'alimentacion': ['carrefour', 'coto', 'disco', 'jumbo', 'vea', 'supermercado', 'mcdonalds', 'starbucks', 'pedidosya'],
    'servicios y comunicaciones': ['personal', 'movistar', 'claro', 'telecom', 'edenor', 'ecogas', 'epec', 'aguas cordobesas'],
    'ocio y entretenimiento': ['netflix', 'spotify', 'steam', 'disney', 'amazon']
}


# 5. Modelos de datos de Pydantic
class Transaccion(BaseModel):
    descripcion: str
    valor: float


class SolicitudAnalisis(BaseModel):
    ingreso_mensual: float
    nivel_endeudamiento: float
    frecuencia_ahorro: str
    transacciones: List[Transaccion]
    
@app.post("/test")
def test():
    return {"ok": True}

# 6. Health check
@app.get("/health")
def health():
    return {"status": "ok"}


    # 7. Endpoint de Predicción
@app.post("/predict")
def predict(solicitud: SolicitudAnalisis):

        if modelo is None:
            return {"error": "Modelo no cargado"}

        predicciones = []

        for t in solicitud.transacciones:
            texto_limpio = limpiar_extracto(t.descripcion)
            categoria_asignada = None
            
            # Capa 1: Filtro por Reglas Fijas (Captura YPF, Shell, etc. sin pasar por el modelo)
            for categoria, palabras_clave in REGLAS_FIJAS.items():
                if any(kw in texto_limpio for kw in palabras_clave):
                    categoria_asignada = categoria
                    break
            
            # Capa 2: Modelo de Machine Learning (.pkl)
            if categoria_asignada is None:
                # Creamos un DataFrame de 1 fila con las columnas exactas que espera el ColumnTransformer
                input_df = pd.DataFrame([{
                    'Descripcion_Limpia': texto_limpio, 
                    'Monto_Local_ARS': t.valor
                }])
                categoria_asignada = str(modelo.predict(input_df)[0])

            predicciones.append({
                "descripcion_original": t.descripcion,
                "descripcion_limpia": texto_limpio,
                "categoria": categoria_asignada
            })

        print("📤 Predicciones generadas:", predicciones)

        return {
            "predicciones": predicciones
        }
@app.post("/clasificacion-transacciones")
def clasificar_transacciones(solicitud: SolicitudAnalisis):

    if modelo is None:
        return {"error": "Modelo no cargado"}

    categorias = []

    for t in solicitud.transacciones:
        texto_limpio = limpiar_extracto(t.descripcion)
        categoria_asignada = None

        # Capa 1
        for categoria, palabras_clave in REGLAS_FIJAS.items():
            if any(kw in texto_limpio for kw in palabras_clave):
                categoria_asignada = categoria
                break

        # Capa 2
        if categoria_asignada is None:
            input_df = pd.DataFrame([{
                "Descripcion_Limpia": texto_limpio,
                "Monto_Local_ARS": t.valor
            }])
            categoria_asignada = str(modelo.predict(input_df)[0])

        categorias.append(categoria_asignada)

    return {"categorias": categorias}

