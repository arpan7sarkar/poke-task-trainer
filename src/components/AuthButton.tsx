
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';

const AuthButton = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <Button 
      onClick={() => navigate('/auth')} 
      variant="default"
      size="sm"
    >
      Sign In
    </Button>
  );
};

export default AuthButton;
