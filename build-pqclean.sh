#!/bin/bash
set -e

echo "🔨 Building PQClean API..."

# Crear directorio para PQClean API
mkdir -p PQClean-API
cd PQClean-API

# Instalar dependencias del sistema necesarias para compilar
echo "📦 Installing build dependencies..."
sudo apt-get update -qq && \
sudo apt-get install -y -qq \
    build-essential \
    cmake \
    libssl-dev \
    git \
    libboost-all-dev \
    wget \
    libasio-dev \
    pkg-config \
    g++ \
    > /dev/null 2>&1 || echo "⚠️ Some packages may already be installed"

# Instalar Crow v1.0+3
echo "📥 Installing Crow framework..."
if [ ! -d "/usr/local/include/crow" ]; then
    git clone --depth 1 https://github.com/CrowCpp/Crow.git /tmp/crow-build && \
    cd /tmp/crow-build && \
    git checkout v1.0+3 && \
    mkdir build && cd build && \
    cmake .. \
        -DCROW_BUILD_EXAMPLES=OFF \
        -DCROW_BUILD_TESTS=OFF \
        -DCROW_BUILD_DOCS=OFF \
        -DCROW_ENABLE_SSL=OFF && \
    make -j$(nproc) && \
    sudo make install && \
    sudo ldconfig && \
    cd /tmp && rm -rf /tmp/crow-build
fi

cd "$(dirname "$0")/PQClean-API"

# Instalar base64
echo "📥 Installing base64 library..."
if [ ! -f "/usr/local/include/base64.h" ]; then
    git clone --depth 1 https://github.com/ReneNyffenegger/cpp-base64.git /tmp/cpp-base64 && \
    sudo cp /tmp/cpp-base64/base64.h /usr/local/include/ && \
    cp /tmp/cpp-base64/base64.cpp ./base64.cpp && \
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

cd ..

# Obtener pqclean-api.cpp desde GitHub
echo "📥 Downloading pqclean-api.cpp..."
PQCLEAN_API_REPO_URL=${PQCLEAN_API_REPO_URL:-https://github.com/dtote/PQClean-API.git}
PQCLEAN_API_BRANCH=${PQCLEAN_API_BRANCH:-main}

git clone --depth 1 --branch ${PQCLEAN_API_BRANCH} ${PQCLEAN_API_REPO_URL} /tmp/pqclean-api-repo
cp /tmp/pqclean-api-repo/pqclean-api.cpp ./pqclean-api.cpp
rm -rf /tmp/pqclean-api-repo

# Compilar pqclean-api
echo "🔨 Compiling pqclean-api binary..."
g++ -std=c++17 -o pqclean-api pqclean-api.cpp base64.cpp \
    -I. -I./PQClean \
    -L./PQClean/build/lib \
    -lml-kem-512_clean -lml-kem-768_clean -lml-kem-1024_clean \
    -lml-dsa-44_clean -lml-dsa-65_clean -lml-dsa-87_clean \
    -lpqclean_common \
    -lpthread \
    $(pkg-config --cflags --libs crow 2>/dev/null || echo "-lcrow")

chmod +x pqclean-api

echo "✅ PQClean API compiled successfully!"
cd ..

