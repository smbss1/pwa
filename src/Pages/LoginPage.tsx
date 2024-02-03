/* eslint-disable jsx-a11y/anchor-is-valid */

// import { postApi } from "../Util/apiControleur";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { useAuth } from '../Context/AuthContext';
import { LoginSchema, RegisterSchema } from '../Schemas/LoginSchema';
import { z } from 'zod';

interface LoginPageProps {
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [showSignUp, setShowSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const authContext = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  useEffect(() => {
    if (isLoggedIn && location.pathname === '/login') {
    // Redirect to login only if we're not already there
      navigate('/', { replace: true, state: { from: location } });
    }
  }, [isLoggedIn, location, navigate]);

  useEffect(() => {
    setErrors([]);
  }, [showSignUp]);


  const handleSignUpClick = () => setShowSignUp(true);
  const handleSignInClick = () => setShowSignUp(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = RegisterSchema.safeParse({ email, password, username });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setErrors([]); // Clear errors if submission is successful

    try {
      const res = await authContext.register(username, email, password);
      if (!res) {
        alert("Erreur lors de l'inscription");
      }
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error);
      alert("Erreur lors de l'inscription");
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setErrors([]); // Clear errors if submission is successful

    try {
      const res = await authContext.login(email, password);
      if (!res) {
        alert("Identifiants incorrects");
      }
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      alert("Erreur lors de la connexion");
    }
  };

  return (
    <div className="page-login">
      {showSignUp && (
        <div className='content-login'>
          <h1>Inscription</h1>
          <span>APPREND A FAIRE A GRAILLE, OU T'AURAS JAMAIS DE FEMME</span>
          <form className='form-log' onSubmit={handleRegister}>
            <div className='cuisto'>
              {/* <img src='https://freepngimg.com/save/159391-chef-cook-hotel-vector-png-download-free/1280x1280' alt='cuisto'></img> */}
            </div>
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
            <span className='comment'>SUSHI? PIZZA? LES DEUX EN MEME TEMPS?...</span>
            <input
              className='input-log'
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.find((err) => err.path.includes('username')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('username'))?.message}</span>
            )}
            <input
              className='input-log'
              type="email"
              placeholder="Adresse mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.find((err) => err.path.includes('email')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('email'))?.message}</span>
            )}
            <input
              className='input-log'
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.find((err) => err.path.includes('password')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('password'))?.message}</span>
            )}
            <button className='button-log' type='submit'>Je m'inscris</button>
            <a id="SignUp" onClick={handleSignInClick}>deja un compte?</a>
            <div className="social-container">
              {/* <a className="social"><img src="google.png" alt="google logo" /></a>
              <a className="social"><img src="facebook.png" alt="facebook logo" /></a> */}
            </div>
          </form>
      </div>
      )}
      {!showSignUp && (
        <div className='content-login'>
          <h1>Connexion</h1>
          <span>C'EST TROP COMMENT J'AI FAIM</span>
          <form className='form-log' onSubmit={handleLogin}>
          <div className='cuisto'>
            {/* <img src='https://freepngimg.com/save/159391-chef-cook-hotel-vector-png-download-free/1280x1280' alt='cuisto'></img> */}
          </div>
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          <span className='comment'>JE POURRAIS ME FAIRE UN BURGER ??</span>
          <input
            className='input-log'
            type="email"
            placeholder="Adresse mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.find((err) => err.path.includes('email')) && (
            <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('email'))?.message}</span>
          )}
          <input
            className='input-log'
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.find((err) => err.path.includes('password')) && (
            <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('password'))?.message}</span>
          )}
          {/* <a>mot de passe oublié ?</a> */}
          <button className='button-log' type='submit'>Me connecter</button>
          <a id="SignIn" onClick={handleSignUpClick}>pas de compte? inscris-toi</a>
          <div className="social-container">
            {/* <a className="social"><img src="google.png" alt="google logo" /></a>
            <a className="social"><img src="facebook.png" alt="facebook logo" /></a> */}
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default LoginPage;
