#!/bin/bash

# Script de utilidades para Docker - Frontend Karate

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para mostrar el menú
show_menu() {
    echo ""
    echo "🥋 Frontend Karate - Docker Management"
    echo "======================================"
    echo ""
    echo "PRODUCCIÓN:"
    echo "  1) Construir imagen de producción"
    echo "  2) Iniciar contenedor de producción"
    echo "  3) Detener contenedor de producción"
    echo "  4) Ver logs de producción"
    echo ""
    echo "DESARROLLO:"
    echo "  5) Construir imagen de desarrollo"
    echo "  6) Iniciar contenedor de desarrollo"
    echo "  7) Detener contenedor de desarrollo"
    echo "  8) Ver logs de desarrollo"
    echo ""
    echo "UTILIDADES:"
    echo "  9) Ver estado de contenedores"
    echo " 10) Limpiar contenedores e imágenes"
    echo " 11) Abrir shell en contenedor"
    echo " 12) Reconstruir todo (producción)"
    echo ""
    echo "  0) Salir"
    echo ""
}

# Funciones principales

build_prod() {
    print_info "Construyendo imagen de producción..."
    docker-compose --profile production build
    print_success "Imagen de producción construida!"
}

start_prod() {
    print_info "Iniciando contenedor de producción..."
    docker-compose --profile production up -d
    print_success "Contenedor de producción iniciado!"
    print_info "Accede a: http://localhost"
}

stop_prod() {
    print_info "Deteniendo contenedor de producción..."
    docker-compose --profile production down
    print_success "Contenedor de producción detenido!"
}

logs_prod() {
    print_info "Mostrando logs de producción (Ctrl+C para salir)..."
    docker-compose --profile production logs -f
}

build_dev() {
    print_info "Construyendo imagen de desarrollo..."
    docker-compose --profile development build
    print_success "Imagen de desarrollo construida!"
}

start_dev() {
    print_info "Iniciando contenedor de desarrollo..."
    docker-compose --profile development up -d
    print_success "Contenedor de desarrollo iniciado con hot-reload!"
    print_info "Accede a: http://localhost:5173"
}

stop_dev() {
    print_info "Deteniendo contenedor de desarrollo..."
    docker-compose --profile development down
    print_success "Contenedor de desarrollo detenido!"
}

logs_dev() {
    print_info "Mostrando logs de desarrollo (Ctrl+C para salir)..."
    docker-compose --profile development logs -f
}

status() {
    print_info "Estado de contenedores:"
    docker ps -a | grep karate-frontend || echo "No hay contenedores de karate-frontend"
    echo ""
    print_info "Imágenes disponibles:"
    docker images | grep karate-frontend || echo "No hay imágenes de karate-frontend"
}

clean() {
    print_warning "Esta acción eliminará todos los contenedores e imágenes de karate-frontend"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        print_info "Limpiando contenedores..."
        docker-compose --profile production down 2>/dev/null || true
        docker-compose --profile development down 2>/dev/null || true
        
        print_info "Eliminando imágenes..."
        docker rmi karate-frontend:latest 2>/dev/null || true
        docker rmi frontend-karate-frontend-prod 2>/dev/null || true
        docker rmi frontend-karate-frontend-dev 2>/dev/null || true
        
        print_info "Limpiando recursos no utilizados..."
        docker system prune -f
        
        print_success "Limpieza completada!"
    else
        print_info "Operación cancelada"
    fi
}

shell() {
    echo ""
    echo "Selecciona el contenedor:"
    echo "1) Producción"
    echo "2) Desarrollo"
    read -p "Opción: " shell_option
    
    case $shell_option in
        1)
            print_info "Abriendo shell en contenedor de producción..."
            docker exec -it karate-frontend-prod sh
            ;;
        2)
            print_info "Abriendo shell en contenedor de desarrollo..."
            docker exec -it karate-frontend-dev sh
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac
}

rebuild_all() {
    print_info "Reconstruyendo todo desde cero (producción)..."
    docker-compose --profile production down
    docker-compose --profile production build --no-cache
    docker-compose --profile production up -d
    print_success "Reconstrucción completada!"
    print_info "Accede a: http://localhost"
}

# Loop principal
while true; do
    show_menu
    read -p "Selecciona una opción: " choice
    
    case $choice in
        1) build_prod ;;
        2) start_prod ;;
        3) stop_prod ;;
        4) logs_prod ;;
        5) build_dev ;;
        6) start_dev ;;
        7) stop_dev ;;
        8) logs_dev ;;
        9) status ;;
        10) clean ;;
        11) shell ;;
        12) rebuild_all ;;
        0)
            print_info "¡Hasta luego!"
            exit 0
            ;;
        *)
            print_error "Opción inválida. Por favor intenta de nuevo."
            ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
done
