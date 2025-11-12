# 🐳 Quick Start - Docker

## Inicio Rápido

### Usando el Script Interactivo (Recomendado)

```bash
./docker-manager.sh
```

Este script proporciona un menú interactivo para todas las operaciones Docker.

### Comandos Directos

#### Producción (Puerto 80)

```bash
# Iniciar
docker-compose --profile production up -d

# Detener
docker-compose --profile production down

# Ver logs
docker-compose --profile production logs -f
```

Accede a: **http://localhost**

#### Desarrollo (Puerto 5173 con Hot-Reload)

```bash
# Iniciar
docker-compose --profile development up -d

# Detener
docker-compose --profile development down

# Ver logs
docker-compose --profile development logs -f
```

Accede a: **http://localhost:5173**

## 📋 Requisitos

- Docker Desktop instalado
- Docker Compose v2+

## 🛠️ Comandos Útiles

```bash
# Ver contenedores activos
docker ps

# Ver todos los contenedores
docker ps -a

# Limpiar todo
docker system prune -a

# Reconstruir sin cache
docker-compose --profile production build --no-cache
```

## 📚 Documentación Completa

Ver archivo `DOCKER.md` para documentación detallada.

## 🆘 Problemas Comunes

### Puerto ocupado
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar 8080 en lugar de 80
```

### Permisos en Linux
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Limpiar caché
```bash
docker builder prune -a
```
