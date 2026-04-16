import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../../features/auth/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 central setter (fixes your bug)
  const setUser = (userData) => {
    setUserState(userData);

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    const storedUser = localStorage.getItem("user");

    if (storedJwt && storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);

        setJwt(storedJwt);
        setUserState(parsedUser);
      } catch (err) {
        console.error("Invalid user in localStorage:", storedUser);
        localStorage.removeItem("user");
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

      return data;
    } catch (err) {
      setJwt(null);
      setUser(null);
      setError(err.response?.data?.message || "Login failed");
      localStorage.clear();

      throw new Error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setJwt(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // 🔥 THIS FIXES YOUR EDIT ISSUE
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
