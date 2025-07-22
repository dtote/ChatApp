import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login.jsx';
import Signup from './pages/signup/Signup.jsx';
import Home from './pages/home/Home.jsx';
import Communities from './pages/communities/Communities.jsx';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/AuthContext.jsx';
import { CameraProvider } from './context/CameraContext.jsx';

function App() {
  const { authUser } = useAuthContext();
  return (
    <CameraProvider>
      <div className="w-screen h-screen flex items-center justify-center">
        <Routes>
          <Route path="/" element={authUser ? <Home /> : <Navigate to={'/login'} />} />
          <Route path='/signup' element={authUser ? <Navigate to='/' /> : <Signup />} />
          <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
          <Route path='/communities/*' element={<Communities />} />
        </Routes>
        <Toaster />
      </div>
    </CameraProvider>
  );
}




export default App
