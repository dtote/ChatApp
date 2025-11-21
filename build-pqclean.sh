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

# Instalar Crow localmente (header-only, no necesita compilación)
echo "📥 Installing Crow framework..."
CROW_DIR="./crow"
if [ ! -d "$CROW_DIR" ]; then
    # Clonar Crow (header-only library)
    git clone --depth 1 https://github.com/CrowCpp/Crow.git "$CROW_DIR"
    cd "$CROW_DIR"
    # Intentar usar un tag estable, si no existe usar main
    git fetch --tags 2>/dev/null || true
    # Buscar tags que empiecen con v1.0
    TAG=$(git tag 2>/dev/null | grep "^v1.0" | sort -V | tail -1 2>/dev/null || echo "")
    if [ -n "$TAG" ]; then
        echo "📌 Using Crow version: $TAG"
        git checkout "$TAG" 2>/dev/null || echo "⚠️ Tag $TAG not found, using current branch"
    else
        echo "📌 Using Crow main branch"
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

# Determinar flags de Crow (header-only library)
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

echo "📌 Using Crow headers from: $CROW_INCLUDE"

g++ -std=c++17 -o pqclean-api pqclean-api.cpp base64.cpp \
    -I. -I./PQClean -I"$CROW_INCLUDE" \
    -L./PQClean/build/lib \
    -lml-kem-512_clean -lml-kem-768_clean -lml-kem-1024_clean \
    -lml-dsa-44_clean -lml-dsa-65_clean -lml-dsa-87_clean \
    -lpqclean_common \
    -lpthread

chmod +x pqclean-api

echo "✅ PQClean API compiled successfully!"
# Volver al directorio raíz del script
cd "$SCRIPT_DIR" || { echo "❌ Failed to return to script directory"; exit 1; }

