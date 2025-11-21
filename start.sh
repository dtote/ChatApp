#!/bin/bash
set -e

echo "🚀 Starting PQClean API server..."

# Obtener el directorio donde está el script (directorio raíz del proyecto)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PQCLEAN_BINARY="$SCRIPT_DIR/PQClean-API/pqclean-api"

# Buscar el binario en diferentes ubicaciones posibles
if [ ! -f "$PQCLEAN_BINARY" ]; then
    # Intentar rutas alternativas
    if [ -f "./PQClean-API/pqclean-api" ]; then
        PQCLEAN_BINARY="./PQClean-API/pqclean-api"
    elif [ -f "PQClean-API/pqclean-api" ]; then
        PQCLEAN_BINARY="PQClean-API/pqclean-api"
    fi
fi

# Verificar que el binario existe
if [ -f "$PQCLEAN_BINARY" ]; then
    echo "✅ Found PQClean API binary at: $PQCLEAN_BINARY"
    "$PQCLEAN_BINARY" &
    PQCLEAN_PID=$!
    echo "✅ PQClean API started with PID: $PQCLEAN_PID"
    
    # Esperar a que el servidor esté listo (máximo 30 segundos)
    echo "⏳ Waiting for PQClean API to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:5003/health > /dev/null 2>&1; then
            echo "✅ PQClean API is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "⚠️ PQClean API did not start in time, continuing anyway..."
            echo "   This might cause issues. Check logs above for errors."
        fi
        sleep 1
    done
else
    echo "❌ ERROR: PQClean API binary not found"
    echo "   Searched in:"
    echo "     - $SCRIPT_DIR/PQClean-API/pqclean-api"
    echo "     - ./PQClean-API/pqclean-api"
    echo "     - PQClean-API/pqclean-api"
    echo "   Current directory: $(pwd)"
    echo "   Directory contents:"
    ls -la . 2>/dev/null || true
    echo "   PQClean-API directory contents:"
    ls -la PQClean-API 2>/dev/null || true
    exit 1
fi

echo "🚀 Starting Node.js server..."
# Iniciar Node.js (esto reemplaza el proceso actual, por eso usamos exec)
exec node backend/server.js
