#!/bin/bash

echo "🚀 Iniciando Benchmark Post-Cuántico"
echo "===================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instala Node.js v16 o superior."
    exit 1
fi

# Verificar PQClean API
echo "🔍 Verificando PQClean API..."
if curl -s http://localhost:5003/health > /dev/null; then
    echo "✅ PQClean API disponible"
else
    echo "⚠️  PQClean API no disponible en puerto 5003"
    echo "   Inicia con: cd ../PQClean-API && docker-compose up -d"
    echo ""
    echo "   ¿Continuar sin algoritmos post-cuánticos? (s/n)"
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "❌ Abortando benchmark"
        exit 1
    fi
fi

echo ""
echo "📊 Ejecutando benchmark..."
echo "========================="

# Ejecutar benchmark
node benchmark.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Benchmark completado exitosamente!"
    echo "📄 Resultados guardados en: results/benchmark-academico.json"
    echo ""
    echo "📈 Para generar gráficas:"
    echo "   ./generate_charts.sh"
else
    echo "❌ Error ejecutando el benchmark"
    exit 1
fi
