import React, { useContext, useEffect, useState } from 'react';
import { getApi, postApi } from '../Util/apiControleur';
import { getMe } from '../features/users/index.api';

interface AuthContextProps {
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextProps>({
    isLoggedIn: false,
    isLoading: true,
    login: () => Promise.resolve(false),
    register: () => Promise.resolve(false),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: any }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            localStorage.setItem("accessToken", user.accessToken);
            setToken(user.accessToken);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                try {
                    const { data } = await getMe.initiate(undefined)
                    // const response = await getApi('users/me');
                    // const data = await response.json();
                    if (data) {
                        console.log("RESPONSE:", data);
                        localStorage.setItem("username", data.username);
                        localStorage.setItem("userId", data.id.toString());
                    }
                } catch (error) {
                    console.error('There was an error!', error);
                }
            }
        };

        fetchData();
    }, [token]);
  
    const login = async (email: string, password: string) => {
        const data = await postApi('auth/login', {
          email,
          password,
        });
        if (data && data.accessToken) {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem("accessToken", data.accessToken);
            setToken(() => data.accessToken);
            return true;
        } else {
            return false;
        }
    };

    const register = async (username: string, email: string, password: string) => {
        const data = await postApi('auth/register', {
          "username": username,
          "email": email,
          "password": password
        });
        if (data && data.accessToken) {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem("accessToken", data.accessToken);
            setToken(() => data.accessToken);
            return true;
        } else {
            return false;
        }
    };
  
    // const logout = () => {
    //   // Placeholder for logout logic
    //   setUser(null);
    // };
  
    const value = {
      isLoggedIn: !!token,
      isLoading,
      login,
      register,
    //   logout,
    };
  
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};