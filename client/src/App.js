import { useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react'; // Import useEffect for side effects
import { toast } from 'react-toastify'; // Import toast
import './App.css';
import Auth from './Pages/auth/Auth';
import Home from './Pages/home/Home';
import Profile from './Pages/profile/Profile';
// import Services from './Pages/services/Services';
import Header from './Components/Header';
import ForgetPassword from './Pages/forgetpassword';

function App() {
  const user = useSelector((state) => state.authReducer.authData);
  const location = useLocation(); // Get the current route

  const showHeader = !['/login', '/signup','/forgetpassword'].includes(location.pathname);

  useEffect(() => {
    if (user && location.pathname === '/home') {
      toast.success('Welcome back!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    }
  }, [user, location.pathname]); // Trigger when user or pathname changes

  return (
    <div className="App">
      <div className="blur" style={{ top: '-18%', right: '0' }}></div>
      <div className="blur" style={{ top: '36%', left: '-8rem' }}></div>

      {/* Conditionally render the Header */}
      {showHeader && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Auth />} />
        <Route path="/signup" element={user ? <Navigate to="/home" /> : <Auth />} />
        <Route path="/forgetpassword" element={user ? <Navigate to="/home" /> : <ForgetPassword/>} />
        <Route path="/profile/:id" element={<Profile />} />
        {/* <Route path="/services" element={<Services />} /> */}
      </Routes>
    </div>
  );
}

export default App;