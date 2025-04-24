# Etapa 1: Construcción de la app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir la app con un servidor estático
FROM node:18

WORKDIR /app

# Solo copiamos los archivos necesarios desde la etapa de build
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Instalar un servidor estático (puedes usar 'serve' o 'vite' con preview)
RUN npm install -g serve

EXPOSE 3000

# Usa 'serve' para servir la carpeta de build
CMD ["serve", "-s", "dist", "-l", "3000"]
