import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  console.log('Auth.tsx: Auth component rendering');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  console.log('Auth.tsx: About to call useAuth');
  const { signIn, signUp, user, loading } = useAuth();
  console.log('Auth.tsx: useAuth returned:', { user: !!user, loading });
  
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  console.log('Auth.tsx: About to render JSX');

  // Temporary test - simple render first
  return (
    <div style={{ background: 'red', color: 'white', padding: '20px' }}>
      <h1>AUTH PAGE TEST - React is working!</h1>
      <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default Auth;