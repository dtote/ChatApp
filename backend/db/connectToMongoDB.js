import mongoose from "mongoose";

const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGO_DB_URI || process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error("MONGO_DB_URI or MONGO_URI environment variable is not set")
    }

    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout corto para detectar problemas rápido
      socketTimeoutMS: 45000, // Timeout para operaciones
      connectTimeoutMS: 10000, // Timeout para conexión inicial
      maxPoolSize: 10, // Mantener conexiones de red
      retryWrites: true,
      w: 'majority'
    }

    await mongoose.connect(mongoUri, options);
    console.log("✅ Connected to MongoDB successfully");

    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB connection error", err)
    })

    mongoose.connection.on('disconnected', () => {
      console.error("⚠️ MongoDB disconnected. Attempting to reconnect...")
    })

    mongoose.connection.on('reconnected', () => {
      console.log("✅ MongoDB reconnected")
    })
  } catch (error) {
    console.log("❌ Error connecting to the database: ", error.message);
  }
}

export default connectToMongoDB;