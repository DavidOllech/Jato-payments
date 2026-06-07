import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";
import { api, User } from "@/src/lib/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    account_type: "personal" | "business";
    cpf?: string;
    cnpj?: string;
  }) => Promise<{ verification_token?: string | null }>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
      await storage.secureRemove("jato_token");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await storage.secureGet<string>("jato_token", "");
      if (token) {
        await refresh();
      }
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = async (email: string, password: string) => {
    const res = await api.login(email, password);
    await storage.secureSet("jato_token", res.access_token);
    setUser(res.user);
  };

  const signUp: AuthState["signUp"] = async (payload) => {
    const res = await api.signup(payload);
    await storage.secureSet("jato_token", res.access_token);
    setUser(res.user);
    return { verification_token: res.verification_token };
  };

  const signOut = async () => {
    await storage.secureRemove("jato_token");
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    await api.verifyEmail(token);
    await refresh();
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut, verifyEmail, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
