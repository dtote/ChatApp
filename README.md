<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=30&pause=1000&color=00C7B7&center=true&vCenter=true&width=700&lines=Bienvenido+a+ChatApp;Mensajería+Instantánea+Post-Cuántica+Segura;Basada+en+Criptografía+de+Nueva+Generación" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-4DB33D?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Render-Deploy-0077CC?style=flat-square&logo=render" />
</p>

<p align="center">
  <b>🚀 Comunicación cifrada | 🔐 Seguridad post-cuántica | 🎯 Experiencia interactiva</b>
</p>

# ChatApp - Mensajería Segura Post-Cuántica

ChatApp es una aplicación de mensajería instantánea segura, moderna y robusta, diseñada con tecnologías web actuales y cifrado post-cuántico para proteger las comunicaciones frente a amenazas futuras.

[![Ejecutar Pruebas](https://github.com/SamLorenzoSanc/ChatApp/actions/workflows/test.yml/badge.svg)](https://github.com/SamLorenzoSanc/ChatApp/actions/workflows/test.yml)

---

## 🚀 Tecnologías Utilizadas

**Backend:**  
Node.js, Express, MongoDB Atlas (base de datos en la nube).

**Frontend:**  
React.js + TailwindCSS + DaisyUI.

**Cifrado y Seguridad:**  
- Cifrado de mensajes usando ML-KEM (Kyber, criptografía post-cuántica).  
- Firmas digitales con ML-DSA (Dilithium, estándar post-cuántico).  
- Comunicación en tiempo real con Socket.io.  
- Autenticación basada en JSON Web Tokens (JWT) y autenticación facial.

**Almacenamiento de Archivos:**  
- Subida de imágenes, PDFs y vídeos a Cloudinary.

**Otras tecnologías:**  
Face-API.js, OpenAI API, TensorFlow.js, Axios, Cloudinary SDK, JSDOM.

---

## 🛡️ Funcionalidades Principales

### Seguridad Avanzada
- Cifrado de extremo a extremo usando algoritmos post-cuánticos (ML-KEM).
- Firmas digitales para validar la autenticidad de los mensajes (ML-DSA).
- Autenticación facial de usuarios mediante Face-API.js para registro e inicio de sesión.
- Verificación del cifrado mediante escaneo de código QR.
- Análisis automático de URLs para detectar posibles enlaces peligrosos (malware, phishing).

### Chat y Mensajería
- Envío de mensajes cifrados.
- Soporte para archivos adjuntos (imágenes, videos, PDFs).
- Sistema de reacciones a mensajes con emojis.
- Creación y votación de encuestas dinámicas en las conversaciones.
- Cifrado manual: al hacer doble clic sobre un mensaje, el contenido se cifra (formato base64 parcial).
- Popup de información: al hacer clic en el avatar de un usuario en el chat, se abre un popup que muestra su perfil (email, alias y clave pública).

### Gestión Social
- Creación y administración de comunidades (grupos de usuarios).
- Chat individual y grupal.
- Vista interactiva de usuarios y comunidades.

### Inteligencia Artificial
- Resumen de conversaciones con modelos IA de OpenAI y HuggingFace (facebook/bart-large-cnn).
- Chatbot educativo sobre criptografía post-cuántica y ayuda de uso.

### Otras Características
- Eliminación automática de mensajes según la frecuencia configurada por el usuario (1 hora, 1 día, 1 semana...).
- Visualización de claves públicas en un sistema de retículos 3D usando Three.js.
- Diseño responsive y experiencia fluida en dispositivos móviles y de escritorio.

---

## 🛠️ Instalación y Configuración

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/chatapp.git
cd chatapp 
```

### 2. Instala las dependencias

```bash
npm install
npm install --prefix frontend
```

### 3. Configuración de las variables de entorno

Crea un archivo .env en la carpeta raíz del proyecto con el siguiente contenido:

```MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
HUGGINFACE_API_KEY=your_huggingface_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Ejecuta la aplicación en modo desarrollo

```
npm run server
```

El frontend puede ser servido aparte si prefieres, dentro de la carpeta frontend/.

### 5. Pruebas Automáticas 

Las pruebas están implementadas usando Mocha y Chai.

Para lanzar todas las pruebas:

```
npm test
```

Además, se configura una GitHub Action para ejecutar los tests automáticamente en cada push o pull request.

## ☁️ Despliegue en la nube

El despliegue de la aplicación se realiza en Render, asegurando:

Certificados SSL automáticos (cifrado TLS para comunicaciones HTTPS).

Sistema de monitorización con acceso a:

- Logs en tiempo real.
- Consola remota.
- Métricas de recursos (CPU, memoria, tráfico de red).

Esto garantiza una alta disponibilidad y seguridad en tránsito para todos los datos transmitidos entre frontend y backend.

## 📄 Estructura del Proyecto

```
chatapp/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── test/
│   └── server.js
│
├── frontend/
│   ├── src/
│   └── public/
│
├── .github/
│   └── workflows/
│       └── test.yml (GitHub Actions para testing)
│
├── package.json
├── README.md
└── .env (no subir al repositorio)
```

## 🔒 Seguridad Extra

- Protección contra inyección de código y XSS.
- Validación estricta de datos en el backend.
- Upload seguro de archivos usando Multer + Cloudinary.
- Tokens JWT con expiración corta y renovable.
- Cifrado extremo a extremo para mensajes y archivos.
- Sistema de autenticación facial integrado y funcional.

## 📚 Créditos

- [Face-API.js](https://github.com/justadudewhohacks/face-api.js)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [OpenAI API](https://platform.openai.com/)
- [HuggingFace Transformers](https://huggingface.co/transformers/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com/)

## ❤️ Autor
Desarrollado por Samuel Lorenzo Sánchez.