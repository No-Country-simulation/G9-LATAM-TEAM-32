import os
import re
from pathlib import Path
from typing import List, Literal, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
from pydantic import BaseModel, Field, field_validator

# -------------------------
# 1. RUTAS Y CONFIGURACIÓN
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "data-science" / "models" / "modelo_clasificador_gastos.pkl"

modelo = None
PROB_THRESHOLD = 0.50

# Reglas fijas para GASTOS (Argentina + Colombia)
REGLAS_GASTOS = {
    'transporte': [
        'ypf', 'shell', 'axion', 'puma', 'estacion de servicio', 'nafta', 'combustible', 'gnc', 'gasoil',
        'terpel', 'texaco', 'primax', 'biomax', 'uber', 'cabify', 'didi', 'indrive', 'transmilenio', 'mio', 'metro'
    ],
    'alimentacion': [
        'carrefour', 'coto', 'disco', 'jumbo', 'vea', 'supermercado', 'exito', 'olimpica', 'carulla', 
        'tiendas d1', 'd1', 'ara', 'jerk', 'alkosto', 'mcdonalds', 'starbucks', 'pedidosya', 'rappi', 
        'frisby', 'crepes', 'el corral', 'dominos'
    ],
    'servicios y comunicaciones': [
        'personal', 'movistar', 'claro', 'telecom', 'tigo', 'wom', 'etb', 'edenor', 'ecogas', 
        'epec', 'aguas cordobesas', 'epm', 'enel', 'codensa', 'vanti', 'acueducto', 'emcali'
    ],
    'ocio y entretenimiento': [
        'netflix', 'spotify', 'steam', 'disney', 'amazon', 'prime video', 'hbo', 'playstation', 'xbox'
    ]
}

# Reglas fijas para INGRESOS (Argentina + Colombia)
REGLAS_INGRESOS = {
    'ingreso_laboral': [
        'sueldo', 'haberes', 'honorarios', 'nomina', 'acreditacion de haberes', 'quincena',
        'pago de nomina', 'prestaciones', 'prima', 'cesantias'
    ],
    'ingreso_extra': [
        'cashback', 'devolucion', 'reintegro', 'rendimientos', 'intereses ganados', 'premio',
        'rendimiento nequi', 'intereses daviplata'
    ]
}

PREFIJOS_REGEX = re.compile(
    r'\bcompra en\b|\bcompra pos\b|\bdebito automatico\b|\btransf de\b|\btransf a\b|'
    r'\bmp\*\b|\bpago mis cuentas\b|\bpago pse\b|\btransf nequi\b|\btransf daviplata\b|'
    r'\bretiro cajero\b|\babono\b',
    flags=re.IGNORECASE
)


# -------------------------
# 2. LIFESPAN Y APLICACIÓN
# -------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global modelo
    try:
        if MODEL_PATH.exists():
            modelo = joblib.load(MODEL_PATH)
            print("Modelo de ML cargado exitosamente.")
        else:
            print(f"Advertencia: No se encontró el archivo del modelo en {MODEL_PATH}")
    except Exception as e:
        print(f"Error al cargar el modelo .pkl: {e}")
    yield


app = FastAPI(
    title="Servicio de Inferencia Financiera",
    version="0.2.0",
    lifespan=lifespan
)


# -------------------------
# 3. FUNCIONES AUXILIARES
# -------------------------
def limpiar_extracto(texto: str) -> str:
    texto = texto.lower()
    texto = PREFIJOS_REGEX.sub('', texto)
    texto = re.sub(r'\b\d{4,}\b', '', texto)
    texto = re.sub(r'[^\w\s]', ' ', texto)
    return re.sub(r'\s+', ' ', texto).strip()


# -------------------------
# 4. MODELOS DE VALIDACIÓN (PYDANTIC)
# -------------------------
class Transaccion(BaseModel):
    descripcion: str = Field(..., min_length=1, max_length=200)
    valor: float = Field(..., description="Monto del movimiento.")
    tipo: Literal["gasto", "ingreso"] = Field(default="gasto")

    @field_validator("descripcion")
    @classmethod
    def limpiar_texto(cls, v: str) -> str:
        return v.strip()


class SolicitudAnalisis(BaseModel):
    ingreso_mensual: float = Field(..., gt=0)
    nivel_endeudamiento: float = Field(..., ge=0)
    frecuencia_ahorro: str = Field(..., min_length=1)
    transacciones: List[Transaccion]

    @field_validator("transacciones")
    @classmethod
    def validar_lista(cls, v: List[Transaccion]) -> List[Transaccion]:
        if not v:
            raise ValueError("Debe enviar al menos una transacción.")
        return v


# -------------------------
# 5. MOTOR DE INFERENCIA HÍBRIDO
# -------------------------
def procesar_transacciones(transacciones: List[Transaccion]) -> List[Dict[str, Any]]:
    resultados = []
    pendientes_ml = []
    indices_ml = []

    for idx, t in enumerate(transacciones):
        texto_limpio = limpiar_extracto(t.descripcion)
        palabras_texto = set(texto_limpio.split())
        categoria_encontrada = None

        # 1. Evaluación de INGRESOS
        if t.tipo == "ingreso":
            for categoria, palabras_clave in REGLAS_INGRESOS.items():
                for kw in palabras_clave:
                    if (' ' in kw and kw in texto_limpio) or (kw in palabras_texto):
                        categoria_encontrada = categoria
                        break
                if categoria_encontrada:
                    break
            
            resultados.append({
                "descripcion_original": t.descripcion,
                "descripcion_limpia": texto_limpio,
                "tipo": t.tipo,
                "monto": abs(t.valor),
                "categoria": categoria_encontrada or "ingreso_general",
                "metodo": "regla_fija"
            })

        # 2. Evaluación de GASTOS
        else:
            for categoria, palabras_clave in REGLAS_GASTOS.items():
                for kw in palabras_clave:
                    if (' ' in kw and kw in texto_limpio) or (kw in palabras_texto):
                        categoria_encontrada = categoria
                        break
                if categoria_encontrada:
                    break

            if categoria_encontrada:
                resultados.append({
                    "descripcion_original": t.descripcion,
                    "descripcion_limpia": texto_limpio,
                    "tipo": t.tipo,
                    "monto": abs(t.valor),
                    "categoria": categoria_encontrada,
                    "metodo": "regla_fija"
                })
            else:
                resultados.append({
                    "descripcion_original": t.descripcion,
                    "descripcion_limpia": texto_limpio,
                    "tipo": t.tipo,
                    "monto": abs(t.valor),
                    "categoria": None,
                    "metodo": "ml"
                })
                pendientes_ml.append({
                    "Descripcion_Limpia": texto_limpio,
                    "Monto_Local_ARS": abs(t.valor)
                })
                indices_ml.append(idx)

    # Capa 2: Fallback a Machine Learning
    if pendientes_ml:
        if modelo is None:
            for idx_original in indices_ml:
                resultados[idx_original]["categoria"] = "otros_gastos"
        else:
            df_ml = pd.DataFrame(pendientes_ml)

            if hasattr(modelo, "predict_proba"):
                probs = modelo.predict_proba(df_ml)
                classes = modelo.classes_
                
                for i, idx_original in enumerate(indices_ml):
                    max_prob = probs[i].max()
                    best_class = classes[probs[i].argmax()]
                    
                    if max_prob >= PROB_THRESHOLD:
                        resultados[idx_original]["categoria"] = str(best_class)
                    else:
                        resultados[idx_original]["categoria"] = "otros_gastos"
            else:
                predicciones = modelo.predict(df_ml)
                for i, idx_original in enumerate(indices_ml):
                    resultados[idx_original]["categoria"] = str(predicciones[i])

    return resultados


# -------------------------
# 6. ENDPOINTS
# -------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelo_cargado": modelo is not None
    }


@app.post("/predict")
def predict(solicitud: SolicitudAnalisis):
    try:
        predicciones = procesar_transacciones(solicitud.transacciones)
        
        total_ingresos = sum(p["monto"] for p in predicciones if p["tipo"] == "ingreso")
        total_gastos = sum(p["monto"] for p in predicciones if p["tipo"] == "gasto")
        balance = total_ingresos - total_gastos

        # Evaluación del Perfil Financiero
        ratio_ahorro = (balance / solicitud.ingreso_mensual) if solicitud.ingreso_mensual > 0 else 0
        perfil = "Equilibrado"
        if ratio_ahorro < 0 or solicitud.nivel_endeudamiento > 0.4:
            perfil = "En Riesgo / Alto Endeudamiento"
        elif ratio_ahorro > 0.2:
            perfil = "Ahorrador Potencial"

        return {
            "resumen": {
                "total_ingresos": total_ingresos,
                "total_gastos": total_gastos,
                "balance": balance,
                "perfil_financiero": perfil
            },
            "predicciones": predicciones
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno en predicción: {str(e)}")


@app.post("/clasificacion-transacciones")
def clasificar_transacciones(solicitud: SolicitudAnalisis):
    try:
        predicciones = procesar_transacciones(solicitud.transacciones)
        return {"categorias": [p["categoria"] for p in predicciones]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en clasificación: {str(e)}")