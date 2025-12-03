'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  role?: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('🔍 useAuth - Loading user...');
        console.log('Token exists:', !!token);
        console.log('Stored user:', storedUser);

        if (!token || !storedUser) {
          console.log('❌ No token or user found');
          setIsLoading(false);
          setUser(null);
          return;
        }

        const userData = JSON.parse(storedUser);
        console.log('✅ User data parsed:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Also listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = async () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    router.push('/auth/login');
  };

  return { user, isLoading, logout };
}