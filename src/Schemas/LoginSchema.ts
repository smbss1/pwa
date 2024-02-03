import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Adresse électronique invalide'),
  password: z.string().min(5, 'Le mot de passe doit contenir au moins 5 caractères.').max(300),
});

export const RegisterSchema = z.object({
    email: z.string().email('Adresse électronique invalide'),
    password: z.string().min(5, 'Le mot de passe doit contenir au moins 5 caractères.').max(300),
    username: z.string().min(5, 'Le nom d\'utilisateur doit contenir au moins 5 caractères.'),
  });