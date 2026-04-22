# syntax=docker/dockerfile:1.6

# =========================================================
# Stage 1: build del bundle web de Expo (React Native Web)
# =========================================================
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias primero (cache)
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# API URL se resuelve en build-time (EXPO_PUBLIC_*)
ARG EXPO_PUBLIC_API_URL=https://sotfware-ii.onrender.com
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# Copia el resto del proyecto y exporta la web estatica a /app/dist
COPY . .
RUN npx expo export --platform web --output-dir dist

# =========================================================
# Stage 2: servir los estaticos con nginx
# =========================================================
FROM nginx:1.27-alpine AS runtime

# Config nginx (SPA fallback + puerto dinamico de Render via $PORT)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Render / local exponen $PORT. Por defecto 8080 en local.
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/dist /usr/share/nginx/html

# envsubst remplaza ${PORT} en la plantilla al arrancar
CMD ["/bin/sh","-c","envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
