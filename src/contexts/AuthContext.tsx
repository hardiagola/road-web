import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'manthanraithatha01@gmail.com';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  termsAccepted: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; role?: string }>;
  signOut: () => Promise<void>;
  acceptTerms: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolveRole = (email: string | undefined, dbRole: string | null): string => {
    if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return 'admin';
    }
    return dbRole ?? 'user';
  };

  const fetchUserData = async (userId: string, email: string | undefined) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    const userRole = resolveRole(email, roleData?.role ?? null);
    setRole(userRole);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('terms_accepted')
      .eq('id', userId)
      .maybeSingle();
    setTermsAccepted(profileData?.terms_accepted ?? false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id, session.user.email), 0);
      } else {
        setRole(null);
        setTermsAccepted(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!error) {
      await supabase.auth.signOut();
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      const userRole = resolveRole(data.user.email, roleData?.role ?? null);
      setRole(userRole);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('terms_accepted')
        .eq('id', data.user.id)
        .maybeSingle();
      setTermsAccepted(profileData?.terms_accepted ?? false);

      return { error: null, role: userRole };
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setTermsAccepted(false);
  };

  const acceptTerms = async () => {
    if (user) {
      await supabase.from('profiles').update({ terms_accepted: true }).eq('id', user.id);
      setTermsAccepted(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, termsAccepted, loading, signUp, signIn, signOut, acceptTerms }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
