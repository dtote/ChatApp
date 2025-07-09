export const ENV_CONFIG = {
  // APIs externas
  PQCLEAN_API_URL: process.env.PQCLEAN_API_URL || 'http://localhost:5003',

  // Bases de datos (WIP: create local mongodb)
  MONGO_URI: process.env.MONGO_URI,

  // Autenticación
  JWT_SECRET: process.env.JWT_SECRET,

  // APIs de IA
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

  // Servidor
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // URLs para CORS
  FRONTEND_URL: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
}