import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import MyPage from './Pages/MyPage';
import Recipe from './Pages/Recipe';

import { Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';

const ProtectedRoute = () => {
    const { isLoggedIn, isLoading } = useAuth();
    return isLoggedIn || isLoading ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/recipe/:recipeId" element={<Recipe />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile/:username/:userId" element={<ProfilePage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/me/:author" element={<MyPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
