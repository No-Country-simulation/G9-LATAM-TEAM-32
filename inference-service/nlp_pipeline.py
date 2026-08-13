import re
import unicodedata
from pathlib import Path
from datetime import datetime, timedelta
import joblib
import pandas as pd

# -------------------------
# 1. RUTAS Y CONFIGURACIÓN
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
RUTA_MODELO = BASE_DIR.parent / "data-science" / "models" / "modelo_clasificador_gastos.pkl"

# Prefijos comunes de extractos bancarios (Argentina + Colombia)
PREFIJOS_REGEX = re.compile(
    r'\bcompra en\b|\bcompra pos\b|\bdebito automatico\b|\btransf de\b|\btransf a\b|'
    r'\bmp\*\b|\bpago mis cuentas\b|\bpago pse\b|\btransf nequi\b|\btransf daviplata\b|'
    r'\bretiro cajero\b|\babono\b',
    flags=re.IGNORECASE
)


def cargar_modelo():
    """Carga el pipeline serializado si existe."""
    if RUTA_MODELO.exists():
        return joblib.load(RUTA_MODELO)
    return None


# -------------------------
# 2. NORMALIZACIÓN DE TEXTO
# -------------------------
def normalizar_texto_gasto(texto: str) -> str:
    """
    Convierte a minúsculas, remueve prefijos bancarios, quita acentos y caracteres especiales.
    """
    texto = texto.lower()
    # Eliminar prefijos transaccionales
    texto = PREFIJOS_REGEX.sub('', texto)
    # Quitar acentos (NFD)
    texto = unicodedata.normalize('NFD', texto)
    texto = re.sub(r'[\u0300-\u036f]', '', texto)
    # Eliminar números largos (ej. IDs de transacción) y símbolos
    texto = re.sub(r'\b\d{4,}\b', '', texto)
    texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
    return re.sub(r'\s+', ' ', texto).strip()


# -------------------------
# 3. EXTRACTOR DE ENTIDADES
# -------------------------
def extraer_entidades_gasto(texto_raw: str) -> dict:
    texto_lower = texto_raw.lower()
    
    # Expresión regular para detectar importes numéricos ($35.000, 35000, 120.50, etc.)
    patron_monto = r'(\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?)'
    match_monto = re.search(patron_monto, texto_raw)
    
    monto_extraido = 0.0
    if match_monto:
        raw_val = match_monto.group(2).replace('.', '')
        if ',' in match_monto.group(1):
            raw_val = raw_val.replace(',', '.')
        monto_extraido = float(raw_val)

    # Detección de divisas
    moneda_detectada = "ARS"
    if "usd" in texto_lower or "dolar" in texto_lower or "dólar" in texto_lower:
        moneda_detectada = "USD"
    elif "cop" in texto_lower:
        moneda_detectada = "COP"
    elif "mxn" in texto_lower:
        moneda_detectada = "MXN"
    elif "clp" in texto_lower:
        moneda_detectada = "CLP"

    # Detección de fechas relativas
    fecha_gasto = datetime.now()
    if "anteayer" in texto_lower or "antes de ayer" in texto_lower:
        fecha_gasto -= timedelta(days=2)
    elif "ayer" in texto_lower:
        fecha_gasto -= timedelta(days=1)
    
    return {
        "monto": monto_extraido,
        "moneda": moneda_detectada,
        "fecha": fecha_gasto.strftime("%Y-%m-%d")
    }


# -------------------------
# 4. INFERENCIA CON MODELO
# -------------------------
def clasificar_con_confianza(pipeline_modelo, texto_normalizado: str, monto: float = 0.0):
    """
    Recibe la instancia del modelo, ejecuta la inferencia y calcula la confianza real.
    """
    if pipeline_modelo is None:
        return "otros_gastos", 0.0

    df_entrada = pd.DataFrame([{
        "Descripcion_Limpia": texto_normalizado,
        "Monto_Local_ARS": float(monto)
    }])

    # Si el modelo soporta probabilidades
    if hasattr(pipeline_modelo, "predict_proba"):
        probs = pipeline_modelo.predict_proba(df_entrada)[0]
        classes = pipeline_modelo.classes_
        max_idx = probs.argmax()
        return str(classes[max_idx]), float(probs[max_idx])
    
    # Fallback si no tiene predict_proba
    prediccion = pipeline_modelo.predict(df_entrada)[0]
    return str(prediccion), 1.0