import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import multer from "multer";
import axios from "axios";  // Importa axios para hacer solicitudes HTTP a Flask
import bcrypt from 'bcrypt';
import faceapi from 'face-api.js';
import { createCanvas, loadImage } from 'canvas';

const upload = multer({ dest: 'uploads/' }); // Guardar imágenes en el directorio uploads

const loadFaceApiModels = async () => {
  const MODEL_URL = './models'; // Cambia esta ruta si los modelos están en otra ubicación
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
};
// Registrar un nuevo usuario con reconocimiento facial
export const signupFacial = async (req, res) => {
  const { username, password, gender,email } = req.body;
  const profilePicFile = req.file; // Archivo cargado

  // Verificar que el archivo de imagen facial está presente
  if (!req.file) {
    return res.status(400).json({ message: 'Face image is required' });
  }

  const faceId = req.file.filename; // Usar el nombre del archivo como ID facial

  try {
    // Asegurarse de que la contraseña no esté vacía
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Generar un salt y hashear la contraseña
    const salt = await bcrypt.genSalt(10); // Puedes ajustar el número de rondas
    const hashedPassword = await bcrypt.hash(password, salt); // Hashear la contraseña

    // Obtener claves públicas y privadas generadas por Flask
    const { data: keys } = await axios.post('http://127.0.0.1:5001/generate_keys', {
      kem_name: "ML-KEM-512",
    });

    let profilePic;
    // Si se envió una imagen, actualizar la ruta
    if (profilePicFile) {
     profilePic = `/uploads/${profilePicFile.filename}`; // Ruta relativa
    }
    
    // Crear el nuevo usuario
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      gender,
      profilePic,
      faceId,
      publicKey: keys.public_key,
      secretKey: keys.secret_key,
    });

    // Generate JWT token here
    generateTokenAndSetCookie(newUser._id, res);

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Enviar una respuesta exitosa
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmpassword, gender } = req.body;
    const profilePicFile = req.file; // Archivo cargado

    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // HASH PASSWORD
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Ruta predeterminada de imagen de perfil si no se proporciona ninguna
    let profilePic = gender === "male" 
      ? `https://avatar.iran.liara.run/public/boy?username=${username}`
      : `https://avatar.iran.liara.run/public/girl?username=${username}`;

    // Si se envió una imagen, actualizar la ruta
    if (profilePicFile) {
      profilePic = `/uploads/${profilePicFile.filename}`; // Ruta relativa
    }

    // Obtener claves públicas y privadas generadas por Flask
    const { data: keys } = await axios.post('http://127.0.0.1:5001/generate_keys', {
      kem_name: "ML-KEM-512",
    });

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      gender,
      profilePic,
      publicKey: keys.public_key,
      secretKey: keys.secret_key,
    });

    if (newUser) {
      // Generar y asignar el token JWT
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
        publicKey: newUser.publicKey,
        message: "User registered successfully"
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({username});
  
    const isPaswordCorrect = await bcryptjs.compare(password, user?.password || "");
   
    if (!user || !isPaswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      message: "User logged in successfully",
      publicKey: user.publicKey
    });

  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Autenticación facial
export const loginFacial = async (req, res) => {
  try {
    const { username } = req.body;

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Buscar el usuario en la base de datos por el nombre de usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar que el usuario tiene un faceId almacenado
    if (!user.faceId || user.faceId.length === 0) {
      return res.status(400).json({ message: 'No face ID stored for user' });
    }

    // Cargar modelos de face-api.js (solo cargar una vez)
    await loadFaceApiModels();

    // Cargar la imagen usando node-canvas
   
    const img = await loadImage(req.file.path);
    const localCanvas = createCanvas(img.width, img.height);
    const ctx = localCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Detectar caras y obtener el descriptor facial
    const detections = await faceapi.detectSingleFace(localCanvas, new faceapi.TinyFaceDetectorOptions())
                        

    if (detections) {
      const landmarks = await faceapi.detectFaceLandmarks(localCanvas);
      const descriptor = await faceapi.computeFaceDescriptor(localCanvas);
      // Verificar cada paso
      console.log({ detections, landmarks, descriptor });
    } else {
      return res.status(401).json({ message: 'No face detected' });
    }

    // Obtener el descriptor facial de la imagen cargada
    const faceImage = detections.descriptor;

    // Convertir el faceId almacenado del usuario a un Float32Array
    const storedFaceDescriptor = new Float32Array(user.faceId);

    // Comparar los descriptores faciales
    const faceMatcher = new faceapi.FaceMatcher([storedFaceDescriptor]);
    const bestMatch = faceMatcher.findBestMatch(faceImage);

    // Verificar si la distancia de coincidencia es aceptable (umbral de 0.6)
    if (bestMatch.distance < 0.6) {
      // Si la coincidencia es buena, generar un token JWT para el usuario
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Face authentication failed' });
    }

  } catch (error) {
    console.error('Error in loginFacial:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};