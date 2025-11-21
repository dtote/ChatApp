#!/bin/bash
set -e

echo "🚀 Starting PQClean API server..."

# Iniciar PQClean API en background
# El binario debe estar en /app/PQClean-API/pqclean-api después del build
if [ -f "/app/PQClean-API/pqclean-api" ]; then
    /app/PQClean-API/pqclean-api &
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
    echo "❌ ERROR: PQClean API binary not found at /app/PQClean-API/pqclean-api"
    echo "   Make sure PQClean API was compiled successfully during Docker build"
    exit 1
fi

echo "🚀 Starting Node.js server..."
# Iniciar Node.js (esto reemplaza el proceso actual, por eso usamos exec)
exec node backend/server.js
