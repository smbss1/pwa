import { createApiBuilder } from "../../state/createApi";
import { CreateRecipeDto } from "./index.type";

interface Recipe {
  id: number;
  author: any;
  title: string;
  description: string;
  userId: number;
  imageUrl: string;
  cookTime: string;
  likes: number;
  category: string;
  date: string;
  ingredients: { [key: string]: string | number };
  steps: string[];
}

const api = createApiBuilder({
  baseUrl: 'https://pwa.baby:8000/',
  prepareHeader: headers => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// Define an endpoint with complete type safety for request and response
export const getAllRecipes = api.endpoint<unknown, [Recipe]>({
  build: () => ({
    path: `recipes`,
  }),
  tags: ['RECIPES']
});

export const getRecipe = api.endpoint<{ recipeId: string }, Recipe>({
  build: ({ recipeId }) => ({
    path: `recipes/${recipeId}`,
  }),
  tags: ['RECIPE']
});

export const getRecipeByUser = api.endpoint<number, [Recipe]>({
  build: (userId) => ({
    path: `recipes/users/${userId}`,
  }),
  tags: ['USER_RECIPE']
});


export const addRecipe = api.endpoint<CreateRecipeDto | undefined, Recipe>({
  build: (dto) => ({
      path: `recipes`,
      method: 'POST',
      body: dto
  }),
  invalidTags: ['RECIPES', 'USER_RECIPE'],
});

export const deleteRecipe = api.endpoint<number, Recipe>({
  build: (recipeId) => ({
    path: `recipes/${recipeId}`,
    method: 'DELETE',
  }),
  invalidTags: ['RECIPES', 'USER_RECIPE'],
});