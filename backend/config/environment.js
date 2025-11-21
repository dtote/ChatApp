export const ENV_CONFIG = {
  // PQClean API - SIEMPRE usar localhost para evitar rate limiting de Render
  // El servidor PQClean se ejecuta en el mismo contenedor
  PQCLEAN_API_URL: 'http://localhost:5003',

  // Databases (WIP: create local mongodb)
  MONGO_URI: process.env.MONGO_URI,

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET,

  // AI APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

  // Server
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // URLs for CORS
  FRONTEND_URL: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
}