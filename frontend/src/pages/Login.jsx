import React, { useState } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Login to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input name="email" type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} required />
            <Input name="password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Login</Button>
            <p className="text-center text-sm text-gray-600">
              No account? <Link to="/signup" className="text-blue-600">Sign Up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}