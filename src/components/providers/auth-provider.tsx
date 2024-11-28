'use client';
import { auth } from '@/lib/firebase';
import {
  type User,
  type UserCredential,
  onAuthStateChanged,
  signInAnonymously as _signInAnonymously,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
type AuthContextType = {
  user: User | null;
  signInAnonymously: () => Promise<UserCredential>;
  setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signInAnonymously: async () => ({}) as UserCredential,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('auth state changed', user);
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signInAnonymously = useCallback(async () => {
    return await _signInAnonymously(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, signInAnonymously }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
