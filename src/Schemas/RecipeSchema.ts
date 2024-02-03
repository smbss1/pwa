import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'ingrédient ne peut pas être vide'),
  quantity: z.string().min(1, 'La quantité de l\'ingrédient ne peut pas être vide'),
});

export const RecipeSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères.'),
  category: z.string().min(5, 'Veuillez choisir une catégorie.'),
  ingredients: z.array(IngredientSchema).nonempty('La liste des ingrédients ne peut pas être vide'),
  steps: z.array(z.string().min(1, 'Cette étape ne peut pas être vide')).nonempty('La liste des étapes ne peut pas être vide'),
});