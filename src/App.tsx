import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import MyPage from './Pages/MyPage';

import { Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { RecipePage } from './Pages/Recipe';

const ProtectedRoute = () => {
    const { isLoggedIn, isLoading } = useAuth();
    return isLoggedIn || isLoading ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/recipe/:recipeId" element={<RecipePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile/:username/:userId" element={<ProfilePage />} />
                <Route path="/" element={<HomePage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/me/:author" element={<MyPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
