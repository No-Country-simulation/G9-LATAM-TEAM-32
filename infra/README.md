# Infraestructura (OCI)

Esta carpeta guarda notas, scripts o configuración de Infraestructura como Código (IaC) relacionados con Oracle Cloud Infrastructure.

## Pendiente (ver `docs/arquitectura.md`)

- [ ] Confirmar servicio OCI a usar (recomendado: Object Storage).
- [ ] Crear el compartment/bucket del equipo.
- [ ] Documentar aquí el proceso de subida del modelo serializado (`data-science/models/`) al bucket.
- [ ] Documentar variables de entorno necesarias para que `inference-service/` y `backend/` se conecten a OCI (nunca commitear credenciales — usar `.env` local, ya ignorado por `.gitignore`).
