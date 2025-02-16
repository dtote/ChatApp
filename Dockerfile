FROM node:18

# Actualizar paquetes y usar apt para instalar dependencias
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
    && rm -rf /var/lib/apt/lists/*

# Crear y establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install && npm run build

COPY backend backend
# Copiar el resto del código
COPY . .

# Expone el puerto de la aplicación
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["npm", "run", "server"]
