import { createApiBuilder } from "../../state/createApi";

export interface Recipe {
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

export interface IngredientForm {
  name: string;
  quantity: string;
}

export interface StepForm {
  description: string;
}

export interface CreateRecipeDto {
  imageUrl?: string,
  userId: number,
  title: string,
  category: string,
  servings: number,
  cookTime: string,
  description: string,
  ingredients: Record<string, string | number>,
  steps: string[],
};

export interface CreateRecipeFormDto {
  imageUrl?: string,
  title: string,
  category: string,
  servings: number,
  cookTime: string,
  description: string,
  ingredients: IngredientForm[],
  steps: StepForm[],
};