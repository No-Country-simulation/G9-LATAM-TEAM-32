# Cómo contribuir — Team 32

Este repo sigue **GitHub Flow** (ramas cortas + Pull Request) y **Conventional Commits**, recomendados por ser prácticas ligeras y adecuadas a un plazo fijo de 6 semanas.

## 1. Ramas

- `main` siempre debe quedar desplegable/estable.
- Nunca se trabaja directo sobre `main`. Cada tarea va en su propia rama:

```bash
git checkout main && git pull
git checkout -b feature/nombre-corto-de-la-tarea
```

Prefijos sugeridos: `feature/`, `fix/`, `docs/`, `chore/`.

Ejemplos: `feature/endpoint-analisis-financiero`, `fix/validacion-nivel-endeudamiento`, `docs/actualizar-arquitectura`.

## 2. Commits — Conventional Commits

Formato: `tipo(alcance): descripción corta en presente`

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `docs` | Cambios solo de documentación |
| `test` | Agregar o corregir pruebas |
| `refactor` | Cambio de código que no agrega funcionalidad ni corrige errores |
| `chore` | Tareas de mantenimiento (dependencias, configuración) |

Ejemplos:
```
feat(backend): agregar endpoint /analisis-financiero
fix(data-science): corregir codificación de variable categórica
docs(arquitectura): registrar decisión de servicio OCI
```

## 3. Pull Requests

1. Sube tu rama: `git push -u origin feature/nombre-corto`
2. Abre el PR en GitHub (se completa automáticamente con la plantilla).
3. Indica **qué requisito (ID de `docs/requisitos.md`, ej. FR-04) resuelve** el PR.
4. Asigna como revisor a alguien de **otro rol** (control cruzado) — ver matriz de roles en `docs/requisitos.md` / README.
5. Si el PR cierra un issue, agrega `Closes #<número>` en la descripción para que se cierre automáticamente al mergear.
6. Se usa **squash merge** (un commit limpio por PR) — ya configurado como opción por defecto del repositorio.

## 4. Labels

- `area:data-science`, `area:backend`, `area:infra`, `area:docs`
- `priority:must`, `priority:should`, `priority:could`, `priority:wont` (según la clasificación MoSCoW del proyecto)

## 5. Documentos vivos

Los archivos en `docs/` (requisitos, arquitectura, cronograma, herramientas, enlaces) son documentos vivos: se actualizan durante todo el hackathon, no solo al final. Cualquier decisión tomada en una Sprint Planning o Sprint Demo debe reflejarse ahí en las 24 h siguientes.
