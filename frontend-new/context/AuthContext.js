"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("user_email");
    if (token) {
      setAuthToken(token);
      if (email) {
        setUserEmail(email);
      } else if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user?.email) {
            localStorage.setItem("user_email", user.email);
            setUserEmail(user.email);
          }
        }).catch(() => {});
      }
    }
  }, []);

  const login = (token, email) => {
    localStorage.setItem("token", token);
    if (email) {
      localStorage.setItem("user_email", email);
      setUserEmail(email);
    }
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    setAuthToken(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
