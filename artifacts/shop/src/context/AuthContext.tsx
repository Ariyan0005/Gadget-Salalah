import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse, LoginInput, RegisterInput } from "@workspace/api-client-react";
import { useLogin, useLogout, useRegister, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const queryClient = useQueryClient();

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(newToken);
  };

  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (data: LoginInput) => {
    const response = await loginMutation.mutateAsync({ data });
    setToken(response.token);
    queryClient.setQueryData(getGetMeQueryKey(), response.user);
  };

  const registerUser = async (data: RegisterInput) => {
    const response = await registerMutation.mutateAsync({ data });
    setToken(response.token);
    queryClient.setQueryData(getGetMeQueryKey(), response.user);
  };

  const logoutUser = async () => {
    try {
      if (token) {
        await logoutMutation.mutateAsync();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setToken(null);
      queryClient.setQueryData(getGetMeQueryKey(), null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading: isUserLoading, login, register: registerUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
