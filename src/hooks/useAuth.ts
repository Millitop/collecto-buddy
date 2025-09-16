import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  console.log('useAuth.ts: Hook initializing');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('useAuth.ts: State initialized, loading:', loading);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: 'Registreringsfel',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Registrering lyckad!',
        description: 'Kontrollera din e-post för att aktivera kontot.',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Oväntat fel',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Inloggningsfel',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Välkommen tillbaka!',
        description: 'Du är nu inloggad.',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Oväntat fel',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'Utloggningsfel',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Utloggad',
        description: 'Du är nu utloggad.',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Oväntat fel',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};