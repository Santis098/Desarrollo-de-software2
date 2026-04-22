# Inventario — Docker & Render

Este proyecto esta dockerizado end-to-end y listo para desplegar en
[Render](https://render.com) mediante un Blueprint (`render.yaml`).

## Estructura

```
Sotfware-II/
├── backend/backend/          # Spring Boot 3.5 (Java 17, Maven)
│   ├── Dockerfile            # Multi-stage: builder Maven -> runtime JRE Alpine
│   └── .dockerignore
├── frontend/inventario-app/  # Expo (React Native Web)
│   ├── Dockerfile            # Multi-stage: Node build -> nginx Alpine
│   ├── nginx.conf            # SPA fallback + healthcheck + gzip
│   └── .dockerignore
├── docker-compose.yml        # Orquestacion local
└── render.yaml               # Blueprint de Render
```

## Correr todo en local

Requiere Docker Desktop.

1. Crea un archivo `.env` en la raiz del repo (ya esta en `.gitignore`) con las
   credenciales de tu Postgres/Supabase:

   ```env
   SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:6543/postgres?sslmode=require
   SPRING_DATASOURCE_USERNAME=<user>
   SPRING_DATASOURCE_PASSWORD=<password>
   ```

2. Arranca el stack:

   ```bash
   docker compose up --build
   ```

- Backend: http://localhost:8080
- Frontend: http://localhost:3000

El frontend se construye apuntando a `http://localhost:8080`
(vease el build-arg `EXPO_PUBLIC_API_URL` en `docker-compose.yml`).

## Variables de entorno (backend)

Se leen desde `application.properties` con defaults. Para produccion define:

| Variable                      | Descripcion                              |
| ----------------------------- | ---------------------------------------- |
| `PORT`                        | Puerto HTTP (Render lo inyecta)          |
| `SPRING_DATASOURCE_URL`       | JDBC URL de Postgres (Supabase)          |
| `SPRING_DATASOURCE_USERNAME`  | Usuario DB                               |
| `SPRING_DATASOURCE_PASSWORD`  | Password DB                              |
| `JPA_DDL_AUTO`                | `update` / `validate` / `none`           |
| `LOG_SQL_LEVEL`               | Nivel de log de SQL (`INFO`, `DEBUG`)    |

## Variables de entorno (frontend)

| Variable                | Descripcion                                          |
| ----------------------- | ---------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`   | URL del backend. Se inyecta **en build-time** como `ARG`. |
| `PORT`                  | Puerto donde sirve nginx (Render lo inyecta).        |

> Expo solo expone al bundle las variables que empiecen por `EXPO_PUBLIC_`.
> Por eso se pasa como `ARG` en el Dockerfile y queda embebida en el JS final.

## Deploy en Render

1. Haz push del repo a GitHub.
2. En Render -> **Blueprints** -> **New Blueprint Instance** -> selecciona el repo.
3. Render detectara `render.yaml` y creara los 2 servicios.
4. En **inventario-backend**, define las 3 variables secretas:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
5. En **inventario-frontend**, confirma que `EXPO_PUBLIC_API_URL` apunte al
   host publico del backend (Render lo puebla con `fromService`).
   Si prefieres un valor fijo, cambialo a `value: https://tu-backend.onrender.com`
   y configuralo tambien como **Build Arg** en la UI de Render.
6. Render construira con Docker y expondra cada servicio en su propia URL.

## Build manual (sin compose)

Backend:
```bash
docker build -t inventario-backend ./backend/backend
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://..." \
  -e SPRING_DATASOURCE_USERNAME="postgres" \
  -e SPRING_DATASOURCE_PASSWORD="secret" \
  inventario-backend
```

Frontend:
```bash
docker build \
  --build-arg EXPO_PUBLIC_API_URL=https://sotfware-ii.onrender.com \
  -t inventario-frontend ./frontend/inventario-app
docker run --rm -p 3000:8080 inventario-frontend
```
