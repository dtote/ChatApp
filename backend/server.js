import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
dotenv.config();

const PORT = process.env.PORT| 4000;
const app = express();



// app.get('/', (req, res) => {
//   res.send("Hello World");
// });

app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(PORT, () => { 
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});