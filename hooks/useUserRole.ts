/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useUserRole.ts
"use client";

import { useEffect, useState } from "react";
import userInfoStore from "@/store/userInfoStore";
import { authService } from "@/services/auth.service";

export function useUserRole() {
  const { 
    role, 
    firstname, 
    lastname, 
    email, 
    isLoggedIn,
    setRole, 
    setFirstname, 
    setLastname, 
    setEmail, 
    setIsLoggedIn 
  } = userInfoStore();
  
  const [loading, setLoading] = useState(!isLoggedIn); // ✅ إذا لم يكن مسجل، يكون التحميل true

  useEffect(() => {
    if (isLoggedIn && role) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const user = await authService.getCurrentUser();
        setRole(user.role);
        setFirstname(user.firstName);
        setLastname(user.lastName);
        setEmail(user.email);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to fetch user", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [isLoggedIn, role, setRole, setFirstname, setLastname, setEmail, setIsLoggedIn]);

  return {
    role,
    isDean: role === "Dean",
    isEmployee: role === "Employee",
    isReceiver: role === "User" || role === "",
    firstname,
    lastname,
    email,
    isLoggedIn,
    loading, 
  };
}