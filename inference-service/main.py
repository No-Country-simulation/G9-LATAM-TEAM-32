"""
Microservicio de inferencia — Team 32 (Vinnah App)
Carga el modelo serializado por Ciencia de Datos y expone un endpoint
de predicción consumido por el Backend Gateway (Spring Boot).
"""

import os
import re
import unicodedata
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
from fastapi import FastAPI, HTTPException, UploadFile, File
import pandas as pd
import io
from pydantic import BaseModel, Field

app = FastAPI(
    title="Servicio de Inferencia Financiera - Vinnah App",
    version="1.0.0",
    description="API de Clasificación de Gastos y Diagnóstico de Salud Financiera"
)

# ----------------------------------------------------------------------
# Descarga del modelo desde OCI Object Storage (si no existe localmente)
# ----------------------------------------------------------------------
OCI_NAMESPACE = os.environ.get("OCI_OS_NAMESPACE", "grto4sjfqbaf")
OCI_BUCKET = os.environ.get("OCI_OS_BUCKET", "vinnah-models")
OCI_MODEL_NAME = "modelo_ia.pkl"
MODEL_PATH = Path(__file__).parent / OCI_MODEL_NAME

if not MODEL_PATH.exists():
    try:
        import oci
        config = oci.config.from_file()
        client = oci.object_storage.ObjectStorageClient(config)
        resp = client.get_object(OCI_NAMESPACE, OCI_BUCKET, OCI_MODEL_NAME)
        with open(MODEL_PATH, "wb") as f:
            for chunk in resp.data.raw.stream(1024 * 1024):
                f.write(chunk)
        print(f"✅ Modelo descargado desde OCI bucket '{OCI_BUCKET}'")
    except Exception as e:
        print(f"⚠️ No se pudo descargar de OCI: {e}")
        fallback = Path(__file__).parent.parent / "data-science" / "models" / OCI_MODEL_NAME
        if fallback.exists():
            MODEL_PATH = fallback

try:
    modelo_ia = joblib.load(MODEL_PATH)
    print(f"✅ Modelo de IA cargado desde: {MODEL_PATH}")
except Exception as e:
    modelo_ia = None
    print(f"⚠️ No se pudo cargar el modelo: {e}")

# ----------------------------------------------------------------------
# Constantes y Funciones Auxiliares
# ----------------------------------------------------------------------
TASAS_DE_CAMBIO_LATAM = {
    'ARS': 1200.0,
    'COP': 4000.0,
    'MXN': 18.5,
    'CLP': 940.0,
    'USD': 1.0
}

# Prefijos comunes de extractos bancarios (Argentina + Colombia)
PREFIJOS_REGEX = re.compile(
    r'\bcompra en\b|\bcompra pos\b|\bdebito automatico\b|\btransf de\b|\btransf a\b|'
    r'\bmp\*\b|\bpago mis cuentas\b|\bpago pse\b|\btransf nequi\b|\btransf daviplata\b|'
    r'\bretiro cajero\b|\babono\b',
    flags=re.IGNORECASE
)

def normalizar_texto_gasto(texto: str) -> str:
    if not texto:
        return ''
    texto = texto.lower()
    texto = PREFIJOS_REGEX.sub('', texto)
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

def convertir_divisa(valor: float, moneda_origen: str = 'USD', moneda_destino: str = 'ARS'):
    try:
        val_float = float(valor)
        m_origen = str(moneda_origen).upper().strip()
        m_destino = str(moneda_destino).upper().strip()
        
        if m_origen == m_destino:
            return val_float, 1.0
            
        t_origen = TASAS_DE_CAMBIO_LATAM.get(m_origen, 1.0)
        t_destino = TASAS_DE_CAMBIO_LATAM.get(m_destino, 1200.0)
        
        if m_origen in ['USD', 'USDT']:
            return val_float * t_destino, t_destino
        elif m_destino in ['USD', 'USDT']:
            return val_float / t_origen, (1.0 / t_origen)
        else:
            valor_usd = val_float / t_origen
            return valor_usd * t_destino, (t_destino / t_origen)
    except Exception:
        return 0.0, 1.0

def obtener_accion_categoria(cat: str, monto: float, m_local: str) -> str:
    fmt = f"{monto:,.0f} {m_local}".replace(',', '.')
    c = cat.lower().strip()
    if c == 'vivienda':
        return f"revisar y optimizar los gastos fijos de vivienda (alquiler/expensas: {fmt})"
    elif c in ['servicios y comunicaciones', 'servicios']:
        return f"revisar abonos y planes de servicios o telefonía ({fmt})"
    elif c == 'obligaciones y ahorro':
        return f"reestructurar cuotas de tarjetas o préstamos ({fmt})"
    elif c in ['ocio y entretenimiento', 'ocio']:
        return f"reducir compras prescindibles en ocio y salidas ({fmt})"
    elif c == 'alimentacion':
        return f"planificar mejor las compras de supermercado y alimentos ({fmt})"
    else:
        return f"reducir egresos en la categoría {c} ({fmt})"

def generar_recomendaciones_personalizadas(perfil, score_riesgo, ingreso_local, endeudamiento, frecuencia_ahorro, resumen_gastos, total_gastado, ratio_gasto, m_local):
    recomendaciones = []
    
    cat_dominante = max(resumen_gastos, key=resumen_gastos.get) if total_gastado > 0 else 'ocio y entretenimiento'
    monto_cat = resumen_gastos.get(cat_dominante, 0.0)
    pct_cat = round((monto_cat / total_gastado * 100), 1) if total_gastado > 0 else 0.0
    
    end_num = float(endeudamiento)
    ratio_num = round(float(ratio_gasto), 1)
    
    monto_obligaciones = resumen_gastos.get('obligaciones y ahorro', 0.0)
    monto_vivienda = resumen_gastos.get('vivienda', 0.0)
    monto_transporte = resumen_gastos.get('transporte', 0.0)
    
    accion_cat = obtener_accion_categoria(cat_dominante, monto_cat, m_local)

    if perfil == 'En riesgo':
        if end_num > 40:
            if monto_obligaciones > 0:
                fmt_ob = f"{monto_obligaciones:,.0f} {m_local}".replace(',', '.')
                recomendaciones.append(f'⚠️ Nivel de deuda elevado ({end_num}%): Revisa compromisos de préstamos personales, tarjetas o créditos bancarios ({fmt_ob}). Consolida pasivos para reducir cuotas.')
            elif monto_vivienda > 0:
                fmt_viv = f"{monto_vivienda:,.0f} {m_local}".replace(',', '.')
                recomendaciones.append(f'⚠️ Tu costo de vivienda/alquiler representa {fmt_viv}. Evita asumir nuevos compromisos o préstamos mientras regularizas tu presupuesto.')
            else:
                recomendaciones.append(f'⚠️ Nivel de endeudamiento elevado del {end_num}%. Prioriza cancelar deudas pendientes con préstamos o terceros.')
        elif ratio_num > 80:
            recomendaciones.append(f'🚨 Tus gastos representan el {ratio_num}% de tus ingresos. Es urgente congelar nuevos créditos y {accion_cat}.')
        else:
            recomendaciones.append(f'⚠️ Riesgo financiero elevado. Se sugiere {accion_cat} (representa el {pct_cat}% del total).')
            
        if str(frecuencia_ahorro).lower() in ['baja', 'ninguna', '0']:
            recomendaciones.append('Construye un fondo de reserva de emergencia antes de solicitar préstamos adicionales.')
        else:
            if cat_dominante == 'vivienda':
                recomendaciones.append('Evalúa alternativas para estabilizar los gastos fijos del hogar y recuperar tu superávit mensual.')
            elif cat_dominante in ['servicios y comunicaciones', 'servicios']:
                recomendaciones.append('Optimiza tus planes de telefonía e internet para reducir la carga fija mensual.')
            elif cat_dominante == 'obligaciones y ahorro':
                recomendaciones.append('Solicita refinanciación de cuotas o consolidación de deudas para aliviar los compromisos del mes.')
            else:
                recomendaciones.append(f'Modera egresos en la categoría {cat_dominante} para recuperar tu superávit mensual.')

    elif perfil == 'En observacion':
        if end_num >= 25:
            if monto_vivienda > monto_obligaciones and monto_vivienda > 0:
                fmt_viv = f"{monto_vivienda:,.0f} {m_local}".replace(',', '.')
                recomendaciones.append(f'💡 Tu costo de vivienda/alquiler ({fmt_viv}) absorbe parte importante de tus ingresos. Mantén acotados los préstamos personales.')
            elif monto_transporte > 0 and cat_dominante == 'transporte':
                fmt_tr = f"{monto_transporte:,.0f} {m_local}".replace(',', '.')
                recomendaciones.append(f'💡 Los gastos de transporte representan {fmt_tr}. Revisa gastos asociados como seguro, nafta o mantenimiento.')
            else:
                recomendaciones.append(f'💡 Tu nivel de endeudamiento es del {end_num}%. Limita el uso de tarjeta de crédito o la solicitud de préstamos a plazo.')
        elif cat_dominante in ['ocio y entretenimiento', 'alimentacion'] and pct_cat > 30:
            fmt_c = f"{monto_cat:,.0f} {m_local}".replace(',', '.')
            recomendaciones.append(f'💡 La categoría "{cat_dominante}" representa el {pct_cat}% de tus gastos ({fmt_c}). Fija un presupuesto semanal para consumos discretos.')
        else:
            recomendaciones.append(f'💡 Tus gastos suman el {ratio_num}% de tus ingresos. Se recomienda {accion_cat}.')
            
        if str(frecuencia_ahorro).lower() in ['baja', 'media']:
            recomendaciones.append('Automatiza la transferencia del 10% de tus ingresos a un fondo de ahorro apenas cobres tu sueldo.')
        else:
            recomendaciones.append(f'Monitorea la categoría {cat_dominante} para evitar pasar al perfil de riesgo.')

    else:  # Perfil Saludable
        recomendaciones.append(f'✅ ¡Excelente salud financiera! Mantienes tus gastos en un {ratio_num}% de tus ingresos y compromisos crediticios sostenibles ({end_num}%).')
        if pct_cat > 0:
            recomendaciones.append('📈 Con tu capacidad de ahorro actual, explora herramientas como Fondos Comunes o Plazos Fijos para hacer crecer tu capital excedente.')

    return recomendaciones[:2]

# ----------------------------------------------------------------------
# Modelos Pydantic para el Contrato API
# ----------------------------------------------------------------------
class Transaccion(BaseModel):
    descripcion: str
    valor: float
    moneda: Optional[str] = "COP"

class SolicitudAnalisis(BaseModel):
    ingreso_mensual: float
    nivel_endeudamiento: float
    frecuencia_ahorro: Optional[str] = "Media"
    moneda_local_usuario: Optional[str] = "COP"
    transacciones: List[Transaccion]

# ----------------------------------------------------------------------
# Endpoints de la API REST
# ----------------------------------------------------------------------
@app.get("/health")
def health():
    """Health check — usado por el Backend Gateway para verificar disponibilidad."""
    return {
        "status": "ok",
        "modelo_cargado": modelo_ia is not None
    }

@app.post("/predict")
@app.post("/analisis-financiero")
def predict(solicitud: SolicitudAnalisis):
    """
    Endpoint de inferencia: procesa transacciones, clasifica con el modelo NLP
    y genera el diagnóstico de salud financiera con recomendaciones.
    """
    if modelo_ia is None:
        raise HTTPException(status_code=500, detail="El modelo de IA no está cargado en el servidor.")
    
    transacciones_dict = [t.model_dump() for t in solicitud.transacciones]
    
    # Invocación de la inferencia
    m_local = str(solicitud.moneda_local_usuario).upper().strip()
    descripciones_limpias = [normalizar_texto_gasto(t.get('descripcion', '')) for t in transacciones_dict]
    
    try:
        categorias_predichas = modelo_ia.predict(descripciones_limpias)
    except Exception:
        categorias_predichas = ['ocio y entretenimiento'] * len(descripciones_limpias)
    
    detalles_transacciones = []
    valores_locales = []
    
    for t, cat_pred in zip(transacciones_dict, categorias_predichas):
        m_orig_val = float(t.get('valor', 0.0))
        m_orig_curr = str(t.get('moneda', m_local)).upper()
        m_local_val, tasa = convertir_divisa(m_orig_val, m_orig_curr, m_local)
        
        valores_locales.append(m_local_val)
        detalles_transacciones.append({
            'descripcion_original': t.get('descripcion', ''),
            'categoria_asignada': cat_pred,
            'monto_original': round(m_orig_val, 2),
            'moneda_original': m_orig_curr,
            'monto_local_convertido': round(m_local_val, 2),
            'tasa_cambio_aplicada': tasa
        })
        
    resumen_gastos = {
        'vivienda': 0.0,
        'servicios y comunicaciones': 0.0,
        'alimentacion': 0.0,
        'transporte': 0.0,
        'salud y cuidado': 0.0,
        'educacion': 0.0,
        'ocio y entretenimiento': 0.0,
        'obligaciones y ahorro': 0.0
    }
    
    total_gastado = 0.0
    for cat_pred, val in zip(categorias_predichas, valores_locales):
        if cat_pred in resumen_gastos:
            resumen_gastos[cat_pred] = round(resumen_gastos[cat_pred] + val, 2)
        else:
            resumen_gastos['ocio y entretenimiento'] = round(resumen_gastos.get('ocio y entretenimiento', 0.0) + val, 2)
        total_gastado += val
        
    ingreso_local_val, _ = convertir_divisa(solicitud.ingreso_mensual, 'USD', m_local) if float(solicitud.ingreso_mensual) < 10000 else (float(solicitud.ingreso_mensual), 1.0)
    ratio_gasto = ((total_gastado / ingreso_local_val) * 100) if ingreso_local_val > 0 else 0.0
    
    score_riesgo = 0
    end_num = float(solicitud.nivel_endeudamiento)
    if end_num > 40: score_riesgo += 40
    elif end_num > 25: score_riesgo += 25
    else: score_riesgo += 5
        
    if ratio_gasto > 80: score_riesgo += 40
    elif ratio_gasto > 50: score_riesgo += 20
    else: score_riesgo += 5
        
    frecuencias = {'baja': 20, 'media': 10, 'alta': 0}
    score_riesgo += frecuencias.get(str(solicitud.frecuencia_ahorro).lower(), 10)
    
    if score_riesgo >= 60:
        perfil = 'En riesgo'
        prob = round(min(score_riesgo / 100.0, 0.99), 2)
    elif score_riesgo >= 30:
        perfil = 'En observacion'
        prob = round(score_riesgo / 100.0, 2)
    else:
        perfil = 'Saludable'
        prob = round(1.0 - (score_riesgo / 100.0), 2)
        
    recomendaciones = generar_recomendaciones_personalizadas(
        perfil=perfil,
        score_riesgo=score_riesgo,
        ingreso_local=ingreso_local_val,
        endeudamiento=end_num,
        frecuencia_ahorro=solicitud.frecuencia_ahorro,
        resumen_gastos=resumen_gastos,
        total_gastado=total_gastado,
        ratio_gasto=ratio_gasto,
        m_local=m_local
    )
        
    return {
        'perfil_financiero': perfil,
        'probabilidad_riesgo': prob,
        'moneda_local_usuario': m_local,
        'resumen_gastos_por_categoria': resumen_gastos,
        'total_gastado_local': round(total_gastado, 2),
        'ratio_gasto_ingreso_pct': round(ratio_gasto, 2),
        'recomendaciones': recomendaciones,
        'detalles_transacciones_procesadas': detalles_transacciones
    }

@app.post("/clasificacion-transacciones")
def clasificar_transacciones(payload: Dict[str, Any]):
    """
    Endpoint dedicado para la clasificación simple de transacciones (consumido por Spring Boot).
    Soporta payloads tipo {"transacciones": [{"descripcion": "compra en coto", "valor": 500}]}
    """
    if modelo_ia is None:
        raise HTTPException(status_code=500, detail="El modelo de IA no está cargado en el servidor.")
    
    trans_raw = payload.get("transacciones", [])
    if not trans_raw:
        return []
    
    descripciones = [normalizar_texto_gasto(t.get("descripcion", "")) for t in trans_raw]
    try:
        categorias = list(modelo_ia.predict(descripciones))
        if hasattr(modelo_ia, "predict_proba"):
            probas = modelo_ia.predict_proba(descripciones)
        else:
            probas = None
    except Exception:
        categorias = ["ocio y entretenimiento"] * len(descripciones)
        probas = None

    resultado = []
    for i, (t, cat) in enumerate(zip(trans_raw, categorias)):
        prob = round(float(probas[i].max()), 4) if probas is not None else None
        resultado.append({
            "descripcion": t.get("descripcion", ""),
            "categoria": str(cat),
            "probabilidad": prob
        })
    return resultado

@app.post("/analizar-excel")
async def analizar_excel(file: UploadFile = File(...)):
    """
    Endpoint interactivo: Permite subir un archivo Excel (.xlsx) o CSV de gastos e ingresos,
    clasifica cada transacción con la IA en tiempo real y devuelve el reporte completo.
    """
    if modelo_ia is None:
        raise HTTPException(status_code=500, detail="El modelo de IA no está cargado en el servidor.")
    
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls') or file.filename.endswith('.csv')):
        raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Debe ser .xlsx o .csv")
    
    try:
        content = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer el archivo Excel/CSV: {str(e)}")
    
    # Mapeo flexible de columnas
    col_desc = next((c for c in df.columns if str(c).lower() in ['descripcion', 'description', 'detalle', 'concepto']), None)
    col_monto = next((c for c in df.columns if str(c).lower() in ['monto', 'amount', 'valor', 'precio']), None)
    col_tipo = next((c for c in df.columns if str(c).lower() in ['tipo', 'type', 'transaction type']), None)
    
    if not col_desc or not col_monto:
        raise HTTPException(status_code=400, detail=f"Columnas no reconocidas en el Excel. Debe tener 'Descripcion' y 'Monto'. Columnas halladas: {list(df.columns)}")
    
    transacciones_lista = []
    ingreso_total = 0.0
    
    for _, row in df.iterrows():
        desc = str(row[col_desc]) if pd.notna(row[col_desc]) else ''
        try:
            monto_val = float(row[col_monto])
        except Exception:
            monto_val = 0.0
            
        tipo_val = str(row[col_tipo]).lower() if col_tipo and pd.notna(row[col_tipo]) else 'gasto'
        
        if 'ingreso' in tipo_val or 'credit' in tipo_val or 'paycheck' in desc.lower() or 'sueldo' in desc.lower():
            ingreso_total += monto_val
        else:
            transacciones_lista.append(Transaccion(descripcion=desc, valor=monto_val, moneda="ARS"))
            
    if ingreso_total <= 0:
        ingreso_total = 1800000.0  # Fallback a un ingreso mensual estándar si no se especificaron ingresos
        
    solicitud = SolicitudAnalisis(
        ingreso_mensual=ingreso_total,
        nivel_endeudamiento=30.0,
        frecuencia_ahorro="Media",
        moneda_local_usuario="ARS",
        transacciones=transacciones_lista
    )
    
    resultado = predict(solicitud)
    resultado['nombre_archivo_procesado'] = file.filename
    resultado['ingreso_total_detectado_excel'] = round(ingreso_total, 2)
    return resultado

