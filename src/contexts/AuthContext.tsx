import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'student' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  mustChangePassword: boolean;
  clearMustChangePassword: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  mustChangePassword: false,
  clearMustChangePassword: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchProfile(userId: string): Promise<{ role: UserRole; mustChangePassword: boolean }> {
  const { data } = await supabase
    .from('profiles')
    .select('role, must_change_password')
    .eq('id', userId)
    .single();
  return {
    role: (data?.role as UserRole) ?? 'student',
    mustChangePassword: !!data?.must_change_password,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const handleSetRole = async (currentUser: User) => {
    // FORZAR ROL ADMIN para admin@openview.com temporalmente
    if (currentUser.email === 'admin@openview.com') {
      setRole('admin');
      setMustChangePassword(false);
      return;
    }
    const { role: r, mustChangePassword: mcp } = await fetchProfile(currentUser.id);
    setRole(r);
    setMustChangePassword(mcp);
  };

  useEffect(() => {
    // Safety timeout: never hang more than 5s on load
    const timeout = setTimeout(() => setIsLoading(false), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Resolve loading immediately — don't wait for role fetch
      setIsLoading(false);
      clearTimeout(timeout);
      // Fetch role in the background after spinner is gone
      if (session?.user) {
        handleSetRole(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) {
        handleSetRole(session.user);
      } else {
        setRole(null);
        setMustChangePassword(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setMustChangePassword(false);
  };

  const clearMustChangePassword = () => setMustChangePassword(false);

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, mustChangePassword, clearMustChangePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
