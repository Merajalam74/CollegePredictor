import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import JeeMains from './pages/JeeMains.jsx';
import JeeAdvanced from './pages/JeeAdvanced.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Profile from './pages/Profile.jsx';
import TalkToSenior from './pages/TalkToSenior.jsx';
import Pricing from './pages/Pricing.jsx';
import AiCounsellor from './pages/AiCounsellor.jsx';

// Example ProtectedRoute component (you might want to create this in a separate file)
import { useAuth } from './context/AuthContext.jsx';
import { Navigate, Outlet } from 'react-router-dom';

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
  // Logged in (and has premium if required), render the child component or Outlet
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
          {/* Add other routes needing login but not premium */}
        </Route>

        {/* Premium Protected Routes (Require Login + Premium Sub) */}
         <Route element={<ProtectedRoute premiumOnly={true} />}>
            <Route path="/talk-to-senior" element={<TalkToSenior />} />
            <Route path="/ai-counsellor" element={<AiCounsellor />} />
            {/* Add other premium routes here */}
         </Route>

        {/* Optional: Add a 404 Not Found route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Layout>
  );
}
export default App;