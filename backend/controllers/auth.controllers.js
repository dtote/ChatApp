import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import multer from "multer";
import axios from "axios";  // Importa axios para hacer solicitudes HTTP a Flask
import bcrypt from 'bcrypt';
import faceapi from 'face-api.js';
import { createCanvas, loadImage } from 'canvas';
import { JSDOM } from 'jsdom';

const upload = multer({ dest: 'uploads/' }); // Guardar imágenes en el directorio uploads

// Configurar entorno DOM falso en Node.js
const dom = new JSDOM(`<!DOCTYPE html>`);
global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLImageElement = dom.window.HTMLImageElement;

const loadFaceApiModels = async () => {
  const MODEL_URL = './models'; // Cambia esta ruta si los modelos están en otra ubicación
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
  console.log('Face API models loaded');
};

// Registrar un nuevo usuario con reconocimiento facial
export const signupFacial = async (req, res) => {
  const { username, password, gender, email, faceDescriptor } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!faceDescriptor) {
      return res.status(400).json({ message: 'Face descriptor is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: keys } = await axios.post('https://kyber-api-1.onrender.com/generate_keys', {
      kem_name: "ML-KEM-512",
    });

    let profilePic = gender === "male" 
    ? `https://avatar.iran.liara.run/public/boy?username=${username}`
    : `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      gender,
      profilePic,
      faceDescriptor: JSON.parse(faceDescriptor),
      publicKey: keys.public_key,
      secretKey: keys.secret_key,
    });

    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();

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
    const { data: keys } = await axios.post('https://kyber-api-1.onrender.com/generate_keys', {
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

export const loginFacial = async (req, res) => {
  try {
    // Obtener el descriptor facial del body
    const { faceDescriptor } = req.body;

    // Verificar que se haya enviado el descriptor facial
    if (!faceDescriptor) {
      return res.status(400).json({ message: 'Face descriptor not provided' });
    }

    // Convertir el descriptor facial de JSON a Float32Array
    const inputDescriptor = new Float32Array(JSON.parse(faceDescriptor));

    if (inputDescriptor.length !== 128) {
      return res.status(400).json({ message: 'Invalid face descriptor length' });
    }

    // Obtener todos los usuarios de la base de datos
    const users = await User.find({ faceDescriptor: { $exists: true, $ne: null } });

    if (!users.length) {
      return res.status(404).json({ message: 'No users found with face descriptors' });
    }

    // Crear descriptores etiquetados
    const labeledDescriptors = users.map(user => {
      if (!user.faceDescriptor || !Array.isArray(user.faceDescriptor[0])) {
        console.error(`Invalid descriptor for user: ${user._id}`);
        return null;
      }
      return new faceapi.LabeledFaceDescriptors(
        user._id.toString(), // Usa el ID del usuario como etiqueta
        [new Float32Array(Object.values(user.faceDescriptor[0]))]
      );
    }).filter(desc => desc !== null);

    // Si no hay descriptores válidos, detener el proceso
    if (!labeledDescriptors.length) {
      return res.status(400).json({ message: 'No valid face descriptors found' });
    }

    // Crear FaceMatcher
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const bestMatch = faceMatcher.findBestMatch(inputDescriptor);

    console.log('Best match:', bestMatch);

    if (bestMatch.label !== 'unknown' && bestMatch.distance < 0.80) {
      // Buscar el usuario que coincide con la etiqueta (su _id)
      const matchedUser = users.find(user => user._id.toString() === bestMatch.label);

      if (!matchedUser) {
        return res.status(401).json({ message: 'No matching user found' });
      }

      console.log('Matched user:', matchedUser);

      // Generar token JWT para el usuario
      generateTokenAndSetCookie(matchedUser._id, res);

      return res.status(200).json({
        _id: matchedUser._id,
        username: matchedUser.username,
        email: matchedUser.email,
        profilePic: matchedUser.profilePic,
        message: "User logged in successfully",
        publicKey: matchedUser.publicKey
      });
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