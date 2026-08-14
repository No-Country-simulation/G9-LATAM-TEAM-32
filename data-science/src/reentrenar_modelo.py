"""
Reentrenamiento del modelo de clasificación de gastos.
Amplía el dataset con ejemplos reales en español LATAM para las 8 categorías.
Ejecutar: python data-science/src/reentrenar_modelo.py
"""
import re
import unicodedata
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from pathlib import Path

def normalizar_texto_gasto(texto):
    if not isinstance(texto, str):
        return ''
    texto = texto.lower()
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

# ── Dataset ampliado con descripciones reales de extractos bancarios LATAM ──

DATOS_ENTRENAMIENTO = {
    'alimentacion': [
        'supermercado coto', 'supermercado jumbo', 'supermercado carrefour',
        'supermercado disco', 'supermercado exito', 'supermercado wong',
        'compra en coto', 'compra en jumbo', 'compra mercado libre alimentos',
        'almacen de barrio compra', 'verduleria frutas y verduras',
        'carniceria corte de carne', 'panaderia pan y facturas',
        'fiambreria compra queso jamon', 'dietica productos naturales',
        'pedidos ya comida', 'rappi comida delivery', 'uber eats pedido',
        'ifood pedido comida', 'didi food entrega',
        'mcdonalds hamburguesa', 'burger king combo', 'mostaza menu',
        'starbucks cafe', 'cafe martinez', 'havanna cafe alfajor',
        'restaurante cena', 'restaurante almuerzo', 'parrilla asado',
        'pizzeria pizza', 'sushi delivery', 'comida china restaurante',
        'heladeria helado', 'kiosco golosinas', 'grido helados',
        'empanadas delivery', 'rotiseria pollo', 'comida casera vianda',
        'tienda oxxo snacks', 'tienda ara compras', 'tienda d1 mercado',
        'walmart supermercado', 'soriana super', 'bodega aurrera compra',
        'mercadona compra semanal', 'dia supermercados', 'changomas compra',
        'lacteos la serenisima', 'agua mineral compra', 'bebidas gaseosas',
    ],
    'transporte': [
        'uber viaje', 'cabify viaje', 'didi viaje', 'indrive viaje',
        'beat taxi', 'taxi remis viaje', 'remis aeropuerto',
        'uber viaje trabajo', 'cabify trayecto oficina',
        'indrive viaje comodo', 'didi express recorrido',
        'sube carga tarjeta', 'carga sube subte', 'subte metrobus',
        'colectivo bondi transporte', 'omnibus micro viaje',
        'tren sarmiento pasaje', 'tren roca boleto', 'tren mitre viaje',
        'estacionamiento cochera', 'parking estacionar auto',
        'peaje autopista', 'peaje panamericana', 'telepeaje vial',
        'nafta carga combustible', 'gasolina tanque lleno', 'ypf nafta',
        'shell combustible', 'axion carga nafta', 'gas gnc carga',
        'mecanico reparacion auto', 'taller mecanico service',
        'cambio aceite filtro', 'gomeria neumatico', 'lavadero auto',
        'seguro auto poliza', 'seguro vehiculo cuota',
        'vtv verificacion vehicular', 'patente auto municipal',
        'multa transito infraccion', 'grua remolque auxilio',
        'alquiler auto rent a car', 'bicicleta reparacion', 'ecobici bici',
        'scooter electrico lime', 'moto combustible', 'pasaje avion vuelo',
        'pasaje bus larga distancia', 'flybondi pasaje aereo',
    ],
    'vivienda': [
        'alquiler departamento', 'alquiler mensual depto', 'renta casa',
        'alquiler vivienda', 'alquiler monoambiente', 'pago alquiler',
        'cuota hipoteca banco', 'credito hipotecario cuota', 'hipoteca mensual',
        'expensas consorcio edificio', 'expensas extraordinarias',
        'expensas comunes mensuales', 'administracion edificio',
        'inmobiliaria comision', 'garantia alquiler deposito',
        'gas natural metrogas', 'gas ecogas factura', 'gasnor factura gas',
        'agua aysa factura', 'agua servicio mensual', 'agua potable cuota',
        'electricidad edenor', 'electricidad edesur', 'luz factura mensual',
        'epe santa fe luz', 'epec cordoba electricidad',
        'reparacion plomero casa', 'electricista arreglo', 'pintor pintura casa',
        'ferreteria materiales hogar', 'sodimac materiales construccion',
        'easy hogar compra', 'mueble hogar compra', 'electrodomestico hogar',
        'limpieza hogar productos', 'articulos limpieza', 'lavandina detergente',
        'fumigacion departamento', 'cerrajero emergencia', 'vidriero arreglo',
        'mudanza flete', 'guardamuebles alquiler', 'seguro hogar poliza',
        'impuesto inmobiliario', 'abl tasa municipal', 'tasa municipal vivienda',
    ],
    'servicios y comunicaciones': [
        'personal celular factura', 'claro celular plan', 'movistar celular',
        'tuenti plan datos', 'plan celular mensual', 'recarga celular prepago',
        'fibertel internet', 'telecentro internet', 'movistar fibra internet',
        'claro internet hogar', 'wifi mensual plan', 'internet banda ancha',
        'cablevision television', 'directv satelital', 'flow tv cable',
        'netflix suscripcion', 'spotify premium', 'youtube premium',
        'disney plus suscripcion', 'hbo max plan', 'amazon prime video',
        'star plus streaming', 'apple tv suscripcion', 'paramount plus',
        'playstation plus suscripcion', 'xbox game pass', 'steam juegos',
        'icloud almacenamiento', 'google one storage', 'dropbox plan',
        'mercado libre nivel 6', 'amazon prime envios', 'rappi prime',
        'pedidos ya plus', 'didi club suscripcion',
        'hosting web servidor', 'dominio web anual', 'correo postal envio',
    ],
    'salud y cuidado': [
        'farmacia remedios', 'farmacity compra', 'farmacia del pueblo',
        'farmacia similares', 'farmacia san pablo', 'farmacia guadalajara',
        'compra medicamentos receta', 'remedios ibuprofeno', 'antibiotico compra',
        'consulta medica general', 'consulta medico clinico', 'turno medico',
        'pediatra consulta hijo', 'dermatologo consulta', 'oftalmologo oculista',
        'odontologo dentista', 'tratamiento dental', 'ortodoncia brackets',
        'traumatologo consulta', 'kinesiologo sesion', 'fisioterapia sesion',
        'psicologo terapia sesion', 'psiquiatra consulta', 'nutricionista turno',
        'analisis clinicos laboratorio', 'estudio sangre laboratorio',
        'radiografia estudio medico', 'ecografia turno', 'resonancia magnetica',
        'obra social cuota', 'prepaga cuota mensual', 'osde cuota',
        'swiss medical prepaga', 'galeno cuota salud', 'medife prepaga',
        'gimnasio cuota mensual', 'crossfit cuota', 'natacion pileta',
        'yoga clase mensual', 'pilates estudio', 'personal trainer sesion',
        'peluqueria corte pelo', 'barberia corte', 'manicura unas',
        'spa masaje relajante', 'cosmeticos crema', 'perfumeria compra',
        'optica lentes gafas', 'lentes de contacto compra',
    ],
    'educacion': [
        'universidad cuota mensual', 'cuota universidad facultad',
        'matricula universidad inscripcion', 'arancel universitario',
        'colegio cuota mensual', 'jardin maternal cuota', 'escuela cuota',
        'curso online udemy', 'curso platzi plan', 'curso coursera',
        'curso domestika diseno', 'masterclass suscripcion',
        'educacion it curso', 'coderhouse bootcamp', 'henry bootcamp',
        'digital house curso', 'soy henry cuota', 'acamica curso',
        'clases particulares profesor', 'profesor particular matematica',
        'clases ingles idioma', 'instituto ingles cuota', 'alianza francesa',
        'libreria compra utiles', 'compra libros texto', 'libro amazon kindle',
        'fotocopias apuntes universidad', 'impresion trabajo practico',
        'materiales arte dibujo', 'cuaderno utiles escolares',
        'calculadora cientifica compra', 'notebook computadora estudio',
        'taller capacitacion empresa', 'seminario congreso inscripcion',
        'certificacion examen profesional', 'posgrado maestria cuota',
        'doctorado cuota investigacion', 'beca estudio tramite',
    ],
    'ocio y entretenimiento': [
        'cine entrada pelicula', 'hoyts cine entrada', 'cinemark funcion',
        'teatro obra entrada', 'recital show entrada', 'concierto tickets',
        'estadio futbol entrada', 'cancha futbol 5 alquiler',
        'parque diversiones entrada', 'escape room juego',
        'bowling boliche juego', 'laser tag juego', 'paintball partida',
        'bar cerveza tragos', 'cerveceria artesanal', 'pub salida noche',
        'boliche discoteca entrada', 'after office tragos',
        'viaje vacaciones hotel', 'hotel hospedaje noche', 'hostel alojamiento',
        'airbnb alquiler temporario', 'booking reserva hotel',
        'excursion turismo paseo', 'tour guiado ciudad',
        'ropa shopping compra', 'zara ropa compra', 'nike zapatillas',
        'adidas ropa deportiva', 'h&m ropa', 'falabella compra ropa',
        'mercado libre compra electronica', 'amazon compra gadget',
        'jugueteria regalo', 'juego de mesa compra', 'puzzle rompecabezas',
        'parque acuatico entrada', 'zoologico entrada', 'museo entrada',
        'suscripcion revista', 'libro novela ficcion', 'comic manga compra',
        'tatuaje estudio tattoo', 'piercing joyeria',
    ],
    'obligaciones y ahorro': [
        'cuota prestamo personal', 'prestamo bancario cuota',
        'credito personal cuota mensual', 'pago cuota credito',
        'tarjeta visa pago minimo', 'tarjeta mastercard pago',
        'tarjeta american express', 'pago tarjeta credito resumen',
        'refinanciacion deuda banco', 'consolidacion deudas cuota',
        'prestamo hipotecario cuota', 'cuota auto prendario',
        'leasing vehiculo cuota', 'financiacion compra cuotas',
        'transferencia ahorro mensual', 'deposito plazo fijo banco',
        'fondo comun inversion fci', 'inversion cedear acciones',
        'cripto bitcoin compra ahorro', 'dolar ahorro banco',
        'cuenta ahorro deposito', 'caja ahorro transferencia',
        'seguro vida cuota', 'seguro retiro pension', 'jubilacion aporte',
        'monotributo pago mensual', 'aportes autonomo mensual',
        'impuesto ganancias pago', 'impuesto bienes personales',
        'iva pago mensual', 'ingresos brutos pago',
        'multa afip regularizacion', 'moratoria fiscal cuota',
        'pago deuda familiar', 'prestamo amigo devolucion',
    ],
}

# ── Construir DataFrame ──
rows = []
for categoria, descripciones in DATOS_ENTRENAMIENTO.items():
    for desc in descripciones:
        rows.append({'descripcion': desc, 'categoria': categoria})

df = pd.DataFrame(rows)
df['descripcion_limpia'] = df['descripcion'].apply(normalizar_texto_gasto)

print(f'Total muestras: {len(df)}')
print(f'\nDistribución:')
print(df['categoria'].value_counts().to_string())

# ── Cargar dataset original para complementar ──
base_dir = Path(__file__).resolve().parent.parent
json_path = base_dir / 'data' / 'processed' / 'dataset.json'
if json_path.exists():
    MAPEO = {
        'Groceries': 'alimentacion', 'Restaurants': 'alimentacion',
        'Coffee Shops': 'alimentacion', 'Fast Food': 'alimentacion',
        'Food & Dining': 'alimentacion', 'Shopping': 'ocio y entretenimiento',
        'Music': 'ocio y entretenimiento', 'Movies & Dvds': 'ocio y entretenimiento',
        'Entertainment': 'ocio y entretenimiento', 'Alcohol & Bars': 'ocio y entretenimiento',
        'Gas & Fuel': 'transporte', 'Auto Insurance': 'transporte',
        'Mortgage & Rent': 'vivienda', 'Home Improvement': 'vivienda',
        'Utilities': 'servicios y comunicaciones', 'Mobile Phone': 'servicios y comunicaciones',
        'Internet': 'servicios y comunicaciones', 'Television': 'servicios y comunicaciones',
        'Electronics & Software': 'servicios y comunicaciones',
        'Haircut': 'salud y cuidado', 'Credit Card Payment': 'obligaciones y ahorro',
    }
    df_orig = pd.read_json(json_path)
    df_orig['categoria'] = df_orig['Category'].map(MAPEO)
    df_orig = df_orig.dropna(subset=['categoria'])
    df_orig['descripcion_limpia'] = df_orig['Description'].apply(normalizar_texto_gasto)
    df_orig = df_orig[['descripcion_limpia', 'categoria']]
    df_combined = pd.concat([df[['descripcion_limpia', 'categoria']], df_orig], ignore_index=True)
    print(f'\n+ {len(df_orig)} muestras del dataset original')
else:
    df_combined = df[['descripcion_limpia', 'categoria']]

print(f'Total combinado: {len(df_combined)}')
print(f'\nDistribución final:')
print(df_combined['categoria'].value_counts().to_string())

# ── Entrenar ──
X = df_combined['descripcion_limpia']
y = df_combined['categoria']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

modelo = Pipeline([
    ('vectorizador', TfidfVectorizer(ngram_range=(1, 2), strip_accents='unicode', lowercase=True)),
    ('clasificador', SGDClassifier(loss='log_loss', penalty='l2', alpha=1e-4, random_state=42, max_iter=1000))
])

modelo.fit(X_train, y_train)

y_pred = modelo.predict(X_test)
print('\n' + '='*60)
print('REPORTE DE CLASIFICACIÓN')
print('='*60)
print(classification_report(y_test, y_pred))

# ── Prueba manual ──
print('\n--- Prueba manual ---')
tests = [
    'indrive viaje comodo', 'uber taxi trabajo', 'pagar gasto medico',
    'farmacia remedios', 'supermercado coto compra', 'alquiler departamento',
    'netflix suscripcion', 'cuota universidad', 'prestamo bancario cuota',
    'cerveceria salida amigos', 'luz edenor factura', 'gimnasio cuota',
]
for t in tests:
    limpio = normalizar_texto_gasto(t)
    pred = modelo.predict([limpio])[0]
    prob = modelo.predict_proba([limpio])[0].max()
    print(f'  {t:35s} -> {pred:30s} ({prob:.2%})')

# ── Guardar ──
out1 = base_dir / 'models' / 'modelo_ia.pkl'
out2 = base_dir.parent / 'inference-service' / 'modelo_ia.pkl'
joblib.dump(modelo, out1)
joblib.dump(modelo, out2)
print(f'\nModelo guardado en:\n  {out1}\n  {out2}')
