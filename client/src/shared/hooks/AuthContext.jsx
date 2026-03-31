import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../../features/auth/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    const storedUser = localStorage.getItem("user");

    if (storedJwt && storedUser) {
      setJwt(storedJwt);
      setUser(JSON.parse(storedUser));
      if (storedUser.confirmed) {
        setIsAuthenticated(true);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async ({ identifier, password }) => {
    setIsLoading(true);

    try {
      const data = await loginUser({ identifier, password });
      const userData = {
        _id: data._id,
        identifier: data.identifier,
        role: data.role,
        confirmed: data.confirmed,
        name: data.name,
        phone: data.phone,
        address: data.address,
      };

      setJwt(data.token);
      setUser(userData);

      localStorage.setItem("jwt", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      return data; // ✅ important
    } catch (err) {
      setJwt(null);
      setUser(null);
      setError(err.response?.data?.message || "Login failed");
      localStorage.clear();

      // axios error handling
      throw new Error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");
    setJwt(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        jwt,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
