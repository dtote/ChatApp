FROM node:18

# Configurar zona horaria de forma no interactiva
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Madrid

# Actualizar paquetes y usar apt para instalar dependencias
# Incluye dependencias para Node.js Y para compilar PQClean API
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libpixman-1-dev \
    libpng-dev \
    zlib1g-dev \
    g++ \
    make \
    python3 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    # Dependencias para compilar PQClean API
    cmake \
    libssl-dev \
    git \
    libboost-all-dev \
    wget \
    libasio-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear y establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios para npm install
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm install

# ============================================
# COMPILAR PQClean API
# ============================================
WORKDIR /app/PQClean-API

# Instalar Crow v1.0+3 (la más estable hasta la fecha)
RUN git clone https://github.com/CrowCpp/Crow.git && \
    cd Crow && \
    git checkout v1.0+3 && \
    mkdir build && \
    cd build && \
    cmake .. \
        -DCROW_BUILD_EXAMPLES=OFF \
        -DCROW_BUILD_TESTS=OFF \
        -DCROW_BUILD_DOCS=OFF \
        -DCROW_ENABLE_SSL=OFF && \
    make -j$(nproc) && \
    make install && \
    ldconfig && \
    cd /app/PQClean-API && \
    rm -rf Crow

# Instalar base64 (copiamos el .cpp al directorio de trabajo)
RUN git clone https://github.com/ReneNyffenegger/cpp-base64.git && \
    cp cpp-base64/base64.h /usr/local/include/ && \
    cp cpp-base64/base64.cpp ./base64.cpp && \
    rm -rf cpp-base64

# Clonar PQClean
RUN git clone --depth 1 https://github.com/PQClean/PQClean.git

# Compilar los algoritmos específicos y sus dependencias
RUN cd PQClean && \
    # Compilar las funciones criptográficas usando rutas relativas desde PQClean/
    gcc -c -fPIC common/fips202.c -o fips202.o && \
    gcc -c -fPIC common/randombytes.c -o randombytes.o && \
    ar rcs libpqclean_common.a fips202.o randombytes.o && \
    # Compilar los algoritmos
    make -C crypto_kem/ml-kem-512/clean && \
    make -C crypto_kem/ml-kem-768/clean && \
    make -C crypto_kem/ml-kem-1024/clean && \
    make -C crypto_sign/ml-dsa-44/clean && \
    make -C crypto_sign/ml-dsa-65/clean && \
    make -C crypto_sign/ml-dsa-87/clean && \
    # Verificar dónde están las bibliotecas
    find . -name "*.a" > /tmp/libraries.txt && \
    mkdir -p build/lib && \
    # Copiar todas las bibliotecas a un directorio común
    for lib in $(cat /tmp/libraries.txt); do \
        cp $lib build/lib/; \
    done && \
    # Copiar también la biblioteca común que acabamos de crear
    cp libpqclean_common.a build/lib/

# Obtener el archivo fuente pqclean-api.cpp desde el repositorio de PQClean-API
# Como ChatApp y PQClean-API son repositorios separados, clonamos el archivo desde GitHub
# IMPORTANTE: Ajusta la URL del repositorio si es diferente
ARG PQCLEAN_API_REPO_URL=https://github.com/dtote/PQClean-API.git
ARG PQCLEAN_API_BRANCH=main

# Asegurar que el directorio existe y clonar el archivo
RUN mkdir -p ./PQClean-API && \
    git clone --depth 1 --branch ${PQCLEAN_API_BRANCH} ${PQCLEAN_API_REPO_URL} /tmp/pqclean-api-repo && \
    cp /tmp/pqclean-api-repo/pqclean-api.cpp ./PQClean-API/ && \
    rm -rf /tmp/pqclean-api-repo && \
    echo "✅ Copied pqclean-api.cpp from ${PQCLEAN_API_REPO_URL}"

# Compilar la API con soporte para C++17, incluyendo las dependencias criptográficas
RUN cd /app/PQClean-API && \
    g++ -std=c++17 -o pqclean-api pqclean-api.cpp base64.cpp -I. -I./PQClean \
    -L./PQClean/build/lib \
    -lml-kem-512_clean -lml-kem-768_clean -lml-kem-1024_clean \
    -lml-dsa-44_clean -lml-dsa-65_clean -lml-dsa-87_clean \
    -lpqclean_common \
    -lpthread \
    `pkg-config --cflags --libs crow` && \
    chmod +x pqclean-api

# Volver al directorio principal
WORKDIR /app

# Copiar el resto del código de ChatApp
COPY . .

# Realizar el build del frontend
RUN npm run build

# Copiar y hacer ejecutable el script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expone los puertos de la aplicación
EXPOSE 8080 5003

# Comando para ejecutar ambos servicios usando el script de inicio
CMD ["./start.sh"]
