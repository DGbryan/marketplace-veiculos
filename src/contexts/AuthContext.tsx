// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Usuario = {
  id: string;
  email: string;
  role: string;
  revenda_id: string | null;
};

type AuthContextType = {
  usuario: Usuario | null;
  carregando: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buscarUsuario(session.user.id);
      } else {
        setCarregando(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        buscarUsuario(session.user.id);
      } else {
        setUsuario(null);
        setCarregando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function buscarUsuario(id: string) {
    const { data } = await supabase
      .from("usuarios")
      .select("*, revendas(id)")
      .eq("id", id)
      .single();

    if (data) {
      setUsuario({
        id: data.id,
        email: data.email || "",
        role: data.role,
        revenda_id: data.revenda_id,
      });
    }
    setCarregando(false);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
