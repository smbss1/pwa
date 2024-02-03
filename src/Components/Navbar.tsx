import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../Context/AuthContext";

const Navbar: React.FC = () => {
  const username = localStorage.getItem('username');

  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('accessToken');
    window.location.reload();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <div className="group-left">
          <li className="nav-item">
            <Link to="/">Accueil</Link>
          </li>
          {auth.isLoggedIn && (
            <li className="nav-item">
              <Link to={`/me/${username}`}>Mon Espace</Link>
            </li>
          )}
        </div>
        <div className="group-right">
          <li className="nav-item right">
          {auth.isLoggedIn ? (
            <button onClick={handleLogout} className="signUp">
              <Link to="/login">Me Deconnecter</Link>
            </button>
          ) : (
            <button onClick={handleLogout} className="signUp">
              <Link to="/login">Se Connecter</Link>
            </button>
          )}
          </li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
