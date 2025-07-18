<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=30&pause=1000&color=00C7B7&center=true&vCenter=true&width=700&lines=Welcome+to+PQCare;Secure+Post-Quantum+Instant+Messaging;Based+on+Next-Gen+Cryptography" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-4DB33D?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Render-Deploy-0077CC?style=flat-square&logo=render" />
</p>

<p align="center">
  <b>🚀 Encrypted communication | 🔐 Post-quantum security | 🎯 Interactive experience</b>
</p>

# PQCare - Post-Quantum Secure Messaging

PQCare is a modern, secure and robust instant messaging application, built with current web technologies and post-quantum encryption to protect communication against future threats.

[![Run Tests](https://github.com/SamLorenzoSanc/PQCare/actions/workflows/test.yml/badge.svg)](https://github.com/SamLorenzoSanc/PQCare/actions/workflows/test.yml)

---

## 🚀 Technologies Used

**Backend:**  
Node.js, Express, MongoDB Atlas (cloud database).

**Frontend:**  
React.js + TailwindCSS + DaisyUI.

**Encryption and Security:**  
- Message encryption using ML-KEM (Kyber, post-quantum cryptography).  
- Digital signatures with ML-DSA (Dilithium, post-quantum standard).  
- Real-time communication using Socket.io.  
- Authentication via JSON Web Tokens (JWT) and facial recognition.

**File Storage:**  
- Upload of images, PDFs, and videos to Cloudinary.

**Other Technologies:**  
Face-API.js, OpenAI API, TensorFlow.js, Axios, Cloudinary SDK, JSDOM.

---

## 🛡️ Main Features

### Advanced Security
- End-to-end encryption using post-quantum algorithms (ML-KEM).
- Digital signatures to verify message authenticity (ML-DSA).
- Facial authentication using Face-API.js for sign-up and login.
- Encryption verification via QR code scanning.
- Automatic URL analysis to detect potential malware/phishing links.

### Chat and Messaging
- Encrypted message sending.
- Support for file attachments (images, videos, PDFs).
- Emoji-based reaction system for messages.
- Dynamic polls in conversations.
- Manual encryption: double-clicking a message encrypts its content (partial base64).
- User info popup: clicking on a user's avatar reveals email, alias, and public key.

### Social Features
- Community (group) creation and management.
- Private and group chat.
- Interactive user and community views.

### Artificial Intelligence
- Conversation summarization using OpenAI and HuggingFace models (facebook/bart-large-cnn).
- Educational chatbot about post-quantum cryptography and app guidance.

### Other Features
- Automatic message deletion based on user-defined intervals (1 hour, 1 day, 1 week...).
- 3D lattice-based public key visualization with Three.js.
- Responsive design for both desktop and mobile.

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/youruser/pqcare.git
cd pqcare 
```

### 2. Install dependencies

```bash
npm install
npm install --prefix frontend
```

### 3. Configure environment variables

Create a .env file in the root directory with the following content:

```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
HUGGINFACE_API_KEY=your_huggingface_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4.  Run the application in development mode

```
npm run server
```

The frontend can be served separately from the frontend/ folder if preferred

### 5. Run Automated Tests

Tests are implemented using Mocha and Chai.

To run all tests:

```
npm test
```

GitHub Actions are set up to automatically run tests on each push or pull request.


## ☁️  Cloud Deployment

The application is deployed on Render, ensuring:

Automatic SSL certificates (TLS encryption for HTTPS).

Monitoring system with:

- Real-time logs
- Remote console
- Resource metrics (CPU, memory, network)

This ensures high availability and secure data transmission between frontend and backend.

## 📄 Project Structure

```
pqcare/
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

## 🔒 Additional Security

- Protection against code injection and XSS.
- Strict backend data validation.
- Secure file uploads using Multer + Cloudinary.
- Short-lived and renewable JWTs.
- End-to-end encryption for messages and files.
- Functional facial authentication system.

## 📚 Credits

- [Face-API.js](https://github.com/justadudewhohacks/face-api.js)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [OpenAI API](https://platform.openai.com/)
- [HuggingFace Transformers](https://huggingface.co/transformers/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com/)

## ❤️ Author
Developed by Samuel Lorenzo Sánchez