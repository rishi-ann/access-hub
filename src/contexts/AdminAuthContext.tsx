import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// SECURITY WARNING: Hardcoded credentials are NOT secure for production!
// This is only for demo purposes. Replace with database authentication.
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, password: string) => { success: boolean; error?: string };
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check session storage on mount (persists during browser session only)
  useEffect(() => {
    const adminSession = sessionStorage.getItem("adminSession");
    if (adminSession === "true") {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const adminLogin = (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem("adminSession", "true");
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("adminSession");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
