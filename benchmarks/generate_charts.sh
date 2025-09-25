#!/bin/bash

echo "🎨 Generador de Gráficas Académicas para Benchmark Post-Cuántico"
echo "================================================================="

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no está instalado"
    echo "💡 Instala Python3 primero"
    exit 1
fi

# Verificar si pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 no está instalado"
    echo "💡 Instala pip3 primero"
    exit 1
fi

# Crear y activar entorno virtual si no existe
if [ ! -d "chart_env" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv chart_env
fi

echo "🔧 Activando entorno virtual y instalando dependencias..."
source chart_env/bin/activate && pip install -r requirements.txt

# Verificar que existe el archivo de benchmark
if [ ! -f "results/benchmark-academico.json" ]; then
    echo "❌ Archivo results/benchmark-academico.json no encontrado"
    echo "💡 Ejecuta primero el benchmark:"
    echo "   ./run-benchmark.sh"
    exit 1
fi

# Ejecutar generador de gráficas
echo "🚀 Generando gráficas..."
source chart_env/bin/activate
python3 generate_charts.py

echo "✅ Proceso completado!"
echo "📁 Revisa los archivos PNG generados en este directorio"

# Desactivar entorno virtual
deactivate
