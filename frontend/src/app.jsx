import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import JeeMains from './pages/JeeMains.jsx';
import JeeAdvanced from './pages/JeeAdvanced.jsx';
import Signup from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Profile from './pages/Profile.jsx';
import TalkToSenior from './pages/TalkToSenior.jsx';
import Pricing from './pages/Pricing.jsx';
import AiCounsellor from './pages/AiCounsellor.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Checkout from './pages/Checkout.jsx';

// --- ProtectedRoute Component ---
// This checks if a user is logged in and/or has premium
const ProtectedRoute = ({ children, premiumOnly = false }) => {
  const { userInfo } = useAuth();

  if (!userInfo) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (premiumOnly && userInfo.subscription !== 'premium') {
    // Logged in but not premium, redirect to pricing
    return <Navigate to="/pricing" replace />;
  }

  // User is authorized, render the component
  return children ? children : <Outlet />;
};


function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jee-mains" element={<JeeMains />} />
        <Route path="/jee-advanced" element={<JeeAdvanced />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected Routes (Require Login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */} {/* Removed this */}
        </Route>
        <Route path="/checkout" element={<Checkout />} />
        {/* Premium Protected Routes (Require Login + Premium) */}
         <Route element={<ProtectedRoute premiumOnly={true} />}>
            <Route path="/talk-to-senior" element={<TalkToSenior />} />
            <Route path="/ai-counsellor" element={<AiCounsellor />} />
         </Route>

        {/* Optional: Add a 404 Not Found route */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </Layout>
  );
}
export default App;
