# Docker - Frontend Vue + Vite

Este proyecto utiliza Docker para containerizar la aplicación Vue.js con Vite.

## 🐳 Archivos Docker

- **Dockerfile**: Configuración multi-stage para build y producción
- **nginx.conf**: Configuración de nginx para servir la SPA
- **.dockerignore**: Archivos excluidos del contexto de build
- **docker-compose.yml**: Orquestación del contenedor

## 🚀 Construcción y Ejecución

### Opción 1: Docker Compose (Recomendado)

#### Modo Producción
```bash
# Construir y ejecutar
docker-compose --profile production up -d

# Ver logs
docker-compose --profile production logs -f

# Detener
docker-compose --profile production down

# Reconstruir
docker-compose --profile production up -d --build
```

#### Modo Desarrollo (con hot-reload)
```bash
# Construir y ejecutar
docker-compose --profile development up -d

# Ver logs
docker-compose --profile development logs -f

# Detener
docker-compose --profile development down

# Reconstruir
docker-compose --profile development up -d --build
```

**Acceso:**
- Producción: http://localhost
- Desarrollo: http://localhost:5173

### Opción 2: Docker CLI

```bash
# Construir la imagen
docker build -t karate-frontend:latest .

# Ejecutar el contenedor
docker run -d -p 80:80 --name karate-frontend karate-frontend:latest

# Ver logs
docker logs -f karate-frontend

# Detener y eliminar
docker stop karate-frontend
docker rm karate-frontend
```

## 🔍 Verificación

Una vez ejecutado, accede a: http://localhost

## 📦 Características del Dockerfile

### Etapa 1: Builder
- **Base**: `node:20-alpine` (imagen ligera)
- **Gestor de paquetes**: pnpm
- **Proceso**: Instala dependencias y construye la aplicación

### Etapa 2: Production
- **Base**: `nginx:alpine` (imagen ligera)
- **Servidor**: Nginx
- **Contenido**: Archivos estáticos del build de Vue
- **Puerto**: 80

## ⚙️ Configuración de Nginx

El archivo `nginx.conf` incluye:

✅ Soporte para Vue Router (modo history)
✅ Compresión Gzip
✅ Cache de assets estáticos
✅ Headers de seguridad
✅ Optimizaciones de performance

## 🔧 Personalización

### Cambiar puerto

Edita `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Puerto externo:Puerto interno
```

O en Docker CLI:
```bash
docker run -d -p 8080:80 --name karate-frontend karate-frontend:latest
```

### Variables de entorno

Si necesitas variables de entorno en build time, agrega en el Dockerfile:

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

Y en build:
```bash
docker build --build-arg VITE_API_URL=https://api.ejemplo.com -t karate-frontend .
```

## 📊 Tamaño de la imagen

- **Builder stage**: ~500MB (solo se usa durante build)
- **Production stage**: ~50MB (imagen final)

## 🛠️ Troubleshooting

### Error al construir
```bash
# Limpiar cache de Docker
docker system prune -a

# Reconstruir sin cache
docker-compose build --no-cache
```

### Permisos en Linux
```bash
# Si hay problemas de permisos
sudo chown -R $USER:$USER .
```

### Ver contenido del contenedor
```bash
docker exec -it karate-frontend sh
```

## 📝 Notas

- El build de producción está optimizado para tamaño y performance
- Nginx está configurado para servir SPAs correctamente
- Los assets estáticos tienen cache de 1 año
- La compresión Gzip reduce el tamaño de transferencia

## 🔐 Producción

Para desplegar en producción:

1. Usa variables de entorno para configuración sensible
2. Configura HTTPS con certificados SSL
3. Considera usar un reverse proxy adicional (Traefik, Caddy)
4. Monitorea logs y métricas
5. Implementa backups y rollback strategy
