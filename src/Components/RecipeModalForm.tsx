import React, { useState } from "react";
import './RecipeModalForm.css';
import { RecipeSchema } from "../Schemas/RecipeSchema";
import { z } from "zod";
import { CreateRecipeDto, CreateRecipeFormDto, IngredientForm } from "../features/recipes/index.type";
import { addRecipe } from "../features/recipes/index.api";

const RecipeModalForm = ({ onRecipeCreated }: { onRecipeCreated: () => void }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const { trigger: addRecipeTrigger } = addRecipe.use(undefined);

  const [formData, setFormData] = useState<CreateRecipeFormDto>({
    imageUrl: undefined,
    title: '',
    category: '',
    servings: 1,
    cookTime: '1',
    description: '',
    ingredients: [],
    steps: [],
  });

  const initialFormData: CreateRecipeFormDto = {
    imageUrl: undefined,
    title: '',
    category: '',
    servings: 1,
    cookTime: '1',
    description: '',
    ingredients: [],
    steps: [],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index: number, field: keyof IngredientForm, value: string) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '' }],
    });
  };

  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = { description: value };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { description: '' }],
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const recipeData: CreateRecipeDto = {
      ...formData,
      userId: user.userId,
      ingredients: formData.ingredients.reduce<Record<string, string>>((acc, curr) => ({ ...acc, [curr.name]: curr.quantity }), {}),
      steps: formData.steps.map(step => step.description)
    };

    const formRecipeData = {
      ...formData,
      userId: user.userId,
      steps: formData.steps.map(step => step.description)
    };

    const result = RecipeSchema.safeParse(formRecipeData);
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setErrors([]); // Clear errors if submission is successful
  
    try {
      await addRecipeTrigger(recipeData);
      setFormData({...initialFormData})
      onRecipeCreated();
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <div className="recipe-form-container">
      <div className="corner top-left"></div>
      <div className="corner bottom-left"></div>
      <div className="corner bottom-right"></div>
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="createRecipeForm-layout">
          <div className="createRecipe-left">
            <input
              className="readOnly"
              type="date"
              name="date"
              value={new Date().toISOString().split('T')[0]}
              readOnly
            />
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl ?? ''}
              onChange={handleChange}
              placeholder="Image URL"
            />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre"
            />
            {errors.find((err) => err.path.includes('title')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('title'))?.message}</span>
            )}

            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Selectionner une categorie</option>
              <option value="Pizza">Pizza</option>
              <option value="Burger">Burger</option>
              <option value="Nouille">Nouille</option>
              <option value="Viande">Viande</option>
              <option value="Dessert">Dessert</option>
              <option value="Autre">Autre</option>
            </select>
            {errors.find((err) => err.path.includes('category')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('category'))?.message}</span>
            )}
            <p className="info">nombre de personnes</p>
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              placeholder="Nombre de personnes"
              min={1}
              max={16}
            />
            <p className="info">temps de preparation</p>
            <input
              type="number"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleChange}
              placeholder="Temps de preparation"
              min={1}
              max={120}
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </div>
          <div className="createRecipe-right">
          <div className="ingredients">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="Nom de l'ingredient"
                  />
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    placeholder="Quantité"
                  />
                  {errors.filter((err) => err.path[0] === 'ingredients' && err.path[1] === index).map((error, errorIndex) => (
                    <p key={errorIndex} style={{ color: 'red' }}>
                      {error.message}
                    </p>
                  ))}
                </div>
              ))}
              <button type="button" onClick={handleAddIngredient}>Ajouter un ingredient</button>
            </div>
            {errors.find((err) => err.path.includes('ingredients')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('ingredients'))?.message}</span>
            )}

            <div className="steps">
              <p className="info">Étapes</p>
              {formData.steps.map((step, index) => (
                <input
                  key={index}
                  type="text"
                  value={step.description}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
              ))}
              <button type="button" onClick={handleAddStep}>Ajouter une étape</button>
            </div>
            {errors.find((err) => err.path.includes('steps')) && (
              <span style={{ color: 'red' }}>{errors.find((err) => err.path.includes('steps'))?.message}</span>
            )}
          </div>
        </div>
        <button type="submit" className="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default RecipeModalForm;