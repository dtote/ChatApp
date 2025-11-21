#!/bin/bash
set -e

echo "🔨 Building PQClean API..."

# Obtener el directorio base del script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || { echo "❌ Failed to cd to script directory"; exit 1; }

# Crear directorio para PQClean API y asegurarse de que existe
PQCLEAN_API_DIR="$SCRIPT_DIR/PQClean-API"
mkdir -p "$PQCLEAN_API_DIR" || { echo "❌ Failed to create PQClean-API directory"; exit 1; }

# Verificar que el directorio se creó correctamente
if [ ! -d "$PQCLEAN_API_DIR" ]; then
    echo "❌ PQClean-API directory does not exist after creation"
    exit 1
fi

cd "$PQCLEAN_API_DIR" || { echo "❌ Failed to cd to PQClean-API directory"; exit 1; }

# Instalar dependencias del sistema (sin sudo, Render ya tiene las herramientas básicas)
echo "📦 Checking build dependencies..."
# Render ya tiene g++, cmake, git, pkg-config instalados por defecto
# Solo verificamos que estén disponibles
command -v g++ >/dev/null 2>&1 || { echo "❌ g++ not found"; exit 1; }
command -v cmake >/dev/null 2>&1 || { echo "❌ cmake not found"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git not found"; exit 1; }

# Instalar ASIO standalone (requerido por Crow v2.0+)
echo "📥 Installing ASIO (standalone, header-only)..."
ASIO_INSTALL_DIR="$PQCLEAN_API_DIR/asio-install"
ASIO_INCLUDE_DIR="$ASIO_INSTALL_DIR/include"
if [ ! -f "$ASIO_INCLUDE_DIR/asio.hpp" ] && [ ! -d "$ASIO_INCLUDE_DIR/asio" ]; then
    mkdir -p "$ASIO_INCLUDE_DIR"
    
    # Clonar ASIO standalone (más ligero que Boost.ASIO)
    echo "📥 Cloning ASIO standalone..."
    git clone --depth 1 https://github.com/chriskohlhoff/asio.git /tmp/asio-clone 2>/dev/null || {
        echo "❌ Failed to clone ASIO"
        exit 1
    }
    
    # ASIO standalone tiene diferentes estructuras posibles
    # Buscar asio.hpp en todas las ubicaciones posibles
    ASIO_HPP_SOURCE=""
    
    # Buscar en diferentes estructuras posibles
    if [ -f "/tmp/asio-clone/asio/include/asio.hpp" ]; then
        ASIO_HPP_SOURCE="/tmp/asio-clone/asio/include/asio.hpp"
        ASIO_DIR_SOURCE="/tmp/asio-clone/asio/include"
    elif [ -f "/tmp/asio-clone/include/asio.hpp" ]; then
        ASIO_HPP_SOURCE="/tmp/asio-clone/include/asio.hpp"
        ASIO_DIR_SOURCE="/tmp/asio-clone/include"
    elif [ -f "/tmp/asio-clone/asio/include/asio/asio.hpp" ]; then
        ASIO_HPP_SOURCE="/tmp/asio-clone/asio/include/asio/asio.hpp"
        ASIO_DIR_SOURCE="/tmp/asio-clone/asio/include"
    elif [ -f "/tmp/asio-clone/include/asio/asio.hpp" ]; then
        ASIO_HPP_SOURCE="/tmp/asio-clone/include/asio/asio.hpp"
        ASIO_DIR_SOURCE="/tmp/asio-clone/include"
    fi
    
    if [ -n "$ASIO_HPP_SOURCE" ]; then
        echo "📌 Found ASIO at: $ASIO_HPP_SOURCE"
        # Copiar asio.hpp directamente al directorio de include
        cp "$ASIO_HPP_SOURCE" "$ASIO_INCLUDE_DIR/asio.hpp" || {
            echo "❌ Failed to copy asio.hpp"
            exit 1
        }
        
        # Copiar el directorio asio/ completo si existe (para includes internos)
        if [ -d "$ASIO_DIR_SOURCE/asio" ]; then
            cp -r "$ASIO_DIR_SOURCE/asio" "$ASIO_INCLUDE_DIR/" || true
        fi
    else
        echo "⚠️ ASIO structure not recognized, trying to find asio.hpp..."
        find /tmp/asio-clone -name "asio.hpp" -type f | head -1 | while read found_file; do
            echo "📌 Found asio.hpp at: $found_file"
            cp "$found_file" "$ASIO_INCLUDE_DIR/asio.hpp" || true
            # Copiar el directorio padre si es asio/
            dir_path=$(dirname "$found_file")
            if [ -d "$dir_path/asio" ]; then
                cp -r "$dir_path/asio" "$ASIO_INCLUDE_DIR/" || true
            fi
        done
    fi
    
    rm -rf /tmp/asio-clone
    
    # Verificar que tenemos asio.hpp disponible
    if [ -f "$ASIO_INCLUDE_DIR/asio.hpp" ] || [ -d "$ASIO_INCLUDE_DIR/asio" ]; then
        echo "✅ ASIO installed"
    else
        echo "❌ Failed to install ASIO (asio.hpp not found)"
        exit 1
    fi
fi

# Instalar Crow v2.0+ localmente (requiere ASIO pero no Boost)
echo "📥 Installing Crow framework (v2.0+, requires ASIO)..."
CROW_DIR="./crow"
if [ ! -d "$CROW_DIR" ]; then
    # Clonar Crow (header-only library)
    git clone --depth 1 https://github.com/CrowCpp/Crow.git "$CROW_DIR"
    cd "$CROW_DIR"
    # Buscar tags v2.0+ (que no requieren Boost pero sí ASIO)
    git fetch --tags 2>/dev/null || true
    # Buscar tags que empiecen con v2.
    TAG=$(git tag 2>/dev/null | grep "^v2\." | sort -V | tail -1 2>/dev/null || echo "")
    if [ -n "$TAG" ]; then
        echo "📌 Using Crow version: $TAG (requires ASIO)"
        git checkout "$TAG" 2>/dev/null || {
            echo "⚠️ Tag $TAG not found, trying main branch"
            git checkout main 2>/dev/null || true
        }
    else
        echo "📌 Using Crow main branch (v2.0+, requires ASIO)"
        git checkout main 2>/dev/null || true
    fi
    cd "$PQCLEAN_API_DIR" || { echo "❌ Failed to return to PQClean-API directory"; exit 1; }
fi

# Instalar base64 localmente
echo "📥 Installing base64 library..."
if [ ! -f "./base64.h" ]; then
    git clone --depth 1 https://github.com/ReneNyffenegger/cpp-base64.git /tmp/cpp-base64
    cp /tmp/cpp-base64/base64.h ./
    cp /tmp/cpp-base64/base64.cpp ./
    rm -rf /tmp/cpp-base64
fi

# Clonar PQClean
echo "📥 Cloning PQClean library..."
if [ ! -d "PQClean" ]; then
    git clone --depth 1 https://github.com/PQClean/PQClean.git
fi

# Compilar PQClean
echo "🔨 Compiling PQClean algorithms..."
cd PQClean

# Compilar funciones comunes
gcc -c -fPIC common/fips202.c -o fips202.o
gcc -c -fPIC common/randombytes.c -o randombytes.o
ar rcs libpqclean_common.a fips202.o randombytes.o

# Compilar algoritmos
make -C crypto_kem/ml-kem-512/clean
make -C crypto_kem/ml-kem-768/clean
make -C crypto_kem/ml-kem-1024/clean
make -C crypto_sign/ml-dsa-44/clean
make -C crypto_sign/ml-dsa-65/clean
make -C crypto_sign/ml-dsa-87/clean

# Copiar bibliotecas
find . -name "*.a" > /tmp/libraries.txt
mkdir -p build/lib
for lib in $(cat /tmp/libraries.txt); do
    cp $lib build/lib/
done
cp libpqclean_common.a build/lib/

# Volver al directorio PQClean-API
cd "$PQCLEAN_API_DIR" || { echo "❌ Failed to return to PQClean-API directory"; exit 1; }

# Obtener pqclean-api.cpp desde GitHub
echo "📥 Downloading pqclean-api.cpp..."
PQCLEAN_API_REPO_URL=${PQCLEAN_API_REPO_URL:-https://github.com/dtote/PQClean-API.git}
PQCLEAN_API_BRANCH=${PQCLEAN_API_BRANCH:-main}

git clone --depth 1 --branch ${PQCLEAN_API_BRANCH} ${PQCLEAN_API_REPO_URL} /tmp/pqclean-api-repo
cp /tmp/pqclean-api-repo/pqclean-api.cpp ./pqclean-api.cpp
rm -rf /tmp/pqclean-api-repo

# Compilar pqclean-api
echo "🔨 Compiling pqclean-api binary..."

# Determinar flags de Crow y ASIO
if [ -d "./crow/include" ]; then
    # Crow con estructura include/
    CROW_INCLUDE="./crow/include"
elif [ -d "./crow" ]; then
    # Crow clonado, headers en la raíz
    CROW_INCLUDE="./crow"
else
    echo "❌ Crow not found!"
    exit 1
fi

# ASIO headers - verificar estructura
if [ -f "$ASIO_INCLUDE_DIR/asio.hpp" ]; then
    # asio.hpp está directamente en include/
    ASIO_INCLUDE="$ASIO_INCLUDE_DIR"
elif [ -d "$ASIO_INCLUDE_DIR/asio" ] && [ -f "$ASIO_INCLUDE_DIR/asio/asio.hpp" ]; then
    # asio/ está en include/, copiar asio.hpp al nivel superior
    cp "$ASIO_INCLUDE_DIR/asio/asio.hpp" "$ASIO_INCLUDE_DIR/asio.hpp" 2>/dev/null || true
    ASIO_INCLUDE="$ASIO_INCLUDE_DIR"
elif [ -d "./asio-install/include" ]; then
    ASIO_INCLUDE="./asio-install/include"
else
    echo "❌ ASIO not found!"
    echo "   Checking: $ASIO_INCLUDE_DIR"
    ls -la "$ASIO_INCLUDE_DIR" 2>/dev/null || true
    exit 1
fi

# Verificar que asio.hpp existe antes de compilar
if [ ! -f "$ASIO_INCLUDE/asio.hpp" ]; then
    echo "❌ ERROR: asio.hpp not found at $ASIO_INCLUDE/asio.hpp"
    echo "   Directory contents:"
    ls -la "$ASIO_INCLUDE" 2>/dev/null || true
    exit 1
fi

echo "📌 Using Crow headers from: $CROW_INCLUDE"
echo "📌 Using ASIO headers from: $ASIO_INCLUDE"
echo "✅ Verified asio.hpp exists at: $ASIO_INCLUDE/asio.hpp"

g++ -std=c++17 -o pqclean-api pqclean-api.cpp base64.cpp \
    -I. -I./PQClean -I"$CROW_INCLUDE" -I"$ASIO_INCLUDE" \
    -DASIO_STANDALONE \
    -L./PQClean/build/lib \
    -lml-kem-512_clean -lml-kem-768_clean -lml-kem-1024_clean \
    -lml-dsa-44_clean -lml-dsa-65_clean -lml-dsa-87_clean \
    -lpqclean_common \
    -lpthread

chmod +x pqclean-api

# Verificar que el binario existe y está en el lugar correcto
if [ -f "./pqclean-api" ]; then
    echo "✅ PQClean API compiled successfully!"
    echo "📌 Binary location: $(pwd)/pqclean-api"
    ls -lh ./pqclean-api 2>/dev/null || true
else
    echo "❌ ERROR: pqclean-api binary not found after compilation"
    echo "   Current directory: $(pwd)"
    ls -la . 2>/dev/null || true
    exit 1
fi

# Volver al directorio raíz del script
cd "$SCRIPT_DIR" || { echo "❌ Failed to return to script directory"; exit 1; }

# Verificar que el binario está accesible desde el directorio raíz
if [ -f "$SCRIPT_DIR/PQClean-API/pqclean-api" ]; then
    echo "✅ Binary verified at: $SCRIPT_DIR/PQClean-API/pqclean-api"
else
    echo "⚠️ Warning: Binary not found at expected location: $SCRIPT_DIR/PQClean-API/pqclean-api"
fi

