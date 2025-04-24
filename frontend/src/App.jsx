import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login.jsx';
import Signup from './pages/signup/Signup.jsx';
import Home from './pages/home/Home.jsx';
import Communities from './pages/communities/Communities.jsx';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/AuthContext.jsx';

function App() {
  const { authUser } = useAuthContext();
  return (
    <div className="p-4 sm:h-[800px] md:h-[700px] lg:h-[800px] w-screen h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to={'/login'} />} />
        <Route path='/signup' element={authUser ? <Navigate to='/' /> : <Signup />} />
        <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
        <Route path='/communities/*' element={<Communities />} />
      </Routes>
      <Toaster />
    </div>
  );
}




export default App
