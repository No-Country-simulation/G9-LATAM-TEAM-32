# Setup Local — financial-analysis-api + inference-service

> Guía para levantar el backend (Spring Boot + PostgreSQL) y el microservicio de inferencia (Python/FastAPI) en tu máquina, y probarlos juntos. Documento vivo: si encuentras un paso desactualizado o un problema nuevo, actualízalo.

## 1. Arquitectura (resumen)

```
Backend (Spring Boot, :8080)
  |-> valida request (DTOs + Bean Validation)
  |-> WebClient --> inference-service (FastAPI, :8001)
  |                    |-> normaliza texto, corre modelo_ia.pkl, calcula riesgo
  |                    |-> devuelve JSON (perfil, resumen_gastos, recomendaciones)
  |-> persiste resultado en PostgreSQL (analisis_financieros)
  |-> devuelve respuesta al cliente
```

El backend **no reimplementa lógica de ML** — es un orquestador delgado: valida, delega al modelo Python, persiste, retorna.

## 2. Prerrequisitos

| Herramienta | Versión | Notas |
|---|---|---|
| JDK | 17 | No JRE — necesitas `javac`. Verifica con `javac -version` |
| IntelliJ IDEA | Community o Ultimate | Con plugin de Maven (viene por default) |
| PostgreSQL | 15+ | Instalado localmente, sin Docker |
| pgAdmin | 4 | Para administrar la BD local |
| Python | 3.11 o 3.12 | **No uses 3.13+** — scikit-learn 1.5.2 no tiene wheels precompilados para versiones más nuevas y te va a forzar a compilar desde fuente (necesita Visual Studio Build Tools) |
| Git | cualquiera | — |

## 3. Estructura relevante del repo

```
G9-LATAM-TEAM-32
|-> financial-analysis-api      (backend Spring Boot)
|    |-> src/main/resources
|    |    |-> application.yml               (config base/prod, Oracle — NO tocar para correr local)
|    |    |-> application-local.properties.example  (plantilla — copia y ajusta)
|    |    |-> db/migration/V1__create_initial_schema.sql
|-> data-science                (notebooks, modelos, datasets)
|-> inference-service            (microservicio Python)
|    |-> main.py
|    |-> modelo_ia.pkl
|    |-> requeriments.txt        (sí, con esa ortografía — no es requirements.txt)
```

## 4. Levantar PostgreSQL local

Abre pgAdmin, conéctate al servidor, y en el Query Tool de la base `postgres` (la que existe por default) corre esto **en dos pasos separados** (Postgres no permite `CREATE DATABASE` dentro de una transacción junto con otras sentencias):

**Paso 1:**
```sql
CREATE DATABASE vinah_local;
```

**Paso 2:**
```sql
CREATE USER vinah_user WITH ENCRYPTED PASSWORD 'vinah_pass';
GRANT ALL PRIVILEGES ON DATABASE vinah_local TO vinah_user;
```

**Paso 3:** conéctate a `vinah_local` (click derecho sobre ella en el árbol de la izquierda → Query Tool) y corre:

```sql
GRANT ALL ON SCHEMA public TO vinah_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vinah_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vinah_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO vinah_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO vinah_user;
```

> Si te saltas los `GRANT` sobre tablas específicas, vas a poder crear la BD pero el backend va a fallar con `permission denied for table usuarios` en el primer registro/login, aunque el usuario ya tenga privilegios "generales" sobre la BD.

## 5. Crear el esquema (workaround manual — Flyway tiene un bug pendiente)

> **Nota:** Flyway está configurado en el proyecto pero actualmente no se ejecuta automáticamente al levantar la app (posible problema de orden de inicialización de beans en Spring Boot 4.1 — Hibernate valida el esquema antes de que Flyway migre). Mientras se investiga, el esquema se crea a mano una sola vez.

Conectado a `vinah_local` en pgAdmin, corre:

```sql
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY,
    nombre          VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    fecha_registro  TIMESTAMP NOT NULL
);

CREATE TABLE analisis_financieros (
    id                    UUID PRIMARY KEY,
    usuario_id            UUID NOT NULL REFERENCES usuarios(id),
    ingreso_mensual       NUMERIC(15,2) NOT NULL,
    nivel_endeudamiento   INTEGER NOT NULL,
    frecuencia_ahorro     VARCHAR(255) NOT NULL,
    perfil_financiero     VARCHAR(255),
    probabilidad          DOUBLE PRECISION,
    resumen_gastos        TEXT,
    recomendaciones       TEXT,
    fecha_analisis        TIMESTAMP NOT NULL
);

CREATE TABLE importaciones_csv (
    id                        UUID PRIMARY KEY,
    usuario_id                UUID NOT NULL REFERENCES usuarios(id),
    nombre_archivo            VARCHAR(255) NOT NULL,
    total_filas               INTEGER NOT NULL,
    filas_validas             INTEGER NOT NULL,
    filas_error               INTEGER NOT NULL,
    resultado_clasificacion   TEXT,
    fecha                     TIMESTAMP NOT NULL
);
```

## 6. Configurar el backend

**6.1 Crea `src/main/resources/application-local.properties`** (está en `.gitignore`, no se sube):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vinah_local
spring.datasource.username=vinah_user
spring.datasource.password=vinah_pass
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true

python.service.url=http://localhost:8001

jwt.secret=clave-secreta-desarrollo-local-min-32-caracteres!!
jwt.expiracion-ms=86400000

oci.object-storage.namespace=
oci.object-storage.bucket=
oci.object-storage.region=

logging.level.root=INFO
logging.level.financial_analysis_api=DEBUG
```

**Guarda este archivo en codificación UTF-8** (revisa la esquina inferior derecha de IntelliJ). Si tiene tildes y usa otra codificación, el build de Maven falla con `MalformedInputException`.

**6.2 Verifica que `application.yml` tenga la estrategia snake_case de Jackson** (crítico — sin esto, la comunicación con el `inference-service` falla con error 422):

```yaml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE
```

**6.3 Verifica que el `pom.xml` tenga estas dependencias** (además de las que ya trae el proyecto):

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webclient</artifactId>
</dependency>
```

> El último es obligatorio en Spring Boot 4.x — a diferencia de versiones anteriores, `WebClient.Builder` ya **no** viene incluido con `spring-boot-starter-webflux`; sin este starter dedicado, cualquier clase que inyecte `WebClient.Builder` falla al arrancar con `required a bean of type 'WebClient$Builder' that could not be found`.

**6.4 Activa el perfil `local` en tu Run Configuration de IntelliJ:**

`Run → Edit Configurations → Environment variables →` agrega:
```
SPRING_PROFILES_ACTIVE=local
```

**6.5 Sincroniza Maven y reconstruye:**

Panel de Maven → click derecho sobre el proyecto → **Sync Project**, luego `Build → Rebuild Project` (`Ctrl+Shift+F9`).

**6.6 Corre el backend** con el botón Run de IntelliJ. En el log deberías ver:
```
The following 1 profile is active: "local"
...
HikariPool-1 - Start completed.
Database JDBC URL [jdbc:postgresql://localhost:5432/vinah_local]
```
Sin `SchemaManagementException` al final.

## 7. Configurar el inference-service (Python)

**7.1 Verifica tu versión de Python:**
```powershell
py -0
```
Si no ves 3.11 o 3.12 en la lista, instálalo desde https://www.python.org/downloads/ (marca "Add python.exe to PATH" en el instalador).

**7.2 Crea el entorno virtual dentro de `inference-service/`:**
```powershell
py -3.11 -m venv venv
```

**7.3 Actívalo:**

PowerShell:
```powershell
venv\Scripts\Activate.ps1
```
Git Bash / macOS / Linux:
```bash
source venv/Scripts/activate   # Git Bash en Windows
source venv/bin/activate       # macOS / Linux
```

**7.4 Instala dependencias:**
```powershell
pip install -r requeriments.txt
```

**7.5 Levanta el servidor:**
```powershell
uvicorn main:app --reload --port 8001
```

**7.6 Verifica:** abre http://localhost:8001/health — debe responder:
```json
{"status":"ok","modelo_cargado":true}
```

## 8. Probar el flujo completo (backend + inference-service)

Con **ambos servicios corriendo** (backend en `:8080`, inference-service en `:8001`):

**8.1 Registro:**
```powershell
$registro = @{
    nombre = "Nombre Prueba"
    email = "prueba@vinah.com"
    password = "ClaveSegura123"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/registro" -Method Post -Body $registro -ContentType "application/json"
$token = $authResponse.token
```

**8.2 Análisis financiero** (nota: las claves van en snake_case, coincidiendo con la config de Jackson):
```powershell
$analisisBody = @{
    ingreso_mensual = 3000000
    nivel_endeudamiento = 35
    frecuencia_ahorro = "Media"
    moneda_local_usuario = "COP"
    transacciones = @(
        @{ descripcion = "Supermercado"; valor = 150000; moneda = "COP" },
        @{ descripcion = "Netflix"; valor = 35000; moneda = "COP" }
    )
} | ConvertTo-Json -Depth 5

$resultado = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/analisis-financiero" -Method Post -Body $analisisBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
$resultado | ConvertTo-Json -Depth 5
```

Verifica en pgAdmin (`SELECT * FROM analisis_financieros;`) que la fila se guardó.

## 9. Problemas conocidos / troubleshooting

| Síntoma | Causa | Solución |
|---|---|---|
| `MalformedInputException` al compilar | Archivo `.properties` guardado en codificación distinta a UTF-8 | Cambia la codificación desde IntelliJ (`File Encodings` en Settings, no solo el archivo individual) |
| `No compiler is provided in this environment` | `JAVA_HOME` de la terminal apunta a un JRE, no un JDK | Usa el botón Run de IntelliJ en vez de la terminal, o corrige `JAVA_HOME` |
| `ORA-12541: No se puede conectar` | El perfil `local` no se activó — sigue usando Oracle | Verifica `SPRING_PROFILES_ACTIVE=local` en Environment Variables de la Run Configuration |
| `SchemaManagementException: missing table` | Flyway no corrió (bug pendiente) y las tablas no existen | Corre el script del paso 5 manualmente |
| `permission denied for table usuarios` | Los `GRANT` no se aplicaron a nivel de tabla | Corre los `GRANT ALL PRIVILEGES ON ALL TABLES...` del paso 4 |
| `422 Unprocessable Content` al llamar a `/analisis-financiero` | Falta `property-naming-strategy: SNAKE_CASE` o el `WebClient` no usa el builder autoconfigurado de Spring | Revisa los pasos 6.2 y 6.3 |
| `pip install` intenta compilar scikit-learn desde `.tar.gz` | Python 3.13+ no tiene wheels precompilados para esa versión de scikit-learn | Usa Python 3.11 o 3.12 |
| 503 al llamar al backend | El `inference-service` no está corriendo, o se cayó | Verifica `http://localhost:8001/health` |

## 10. Pendientes conocidos (no bloqueantes)

- **Flyway no se ejecuta automáticamente** al levantar el backend — posible bug de orden de inicialización en Spring Boot 4.1. Investigación en curso; mientras tanto, el esquema se crea manualmente (paso 5).
- **`/clasificacion-transacciones`** no existe todavía en el `inference-service` — pendiente de coordinar con el equipo de Data Science (solo existe `/analisis-financiero`, que incluye clasificación por transacción dentro de su respuesta).