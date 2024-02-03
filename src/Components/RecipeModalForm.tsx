import React, { useEffect, useState, ChangeEvent } from "react";
import Modal from "./Modal";
import './RecipeModalForm.css';
import { info } from "console";
import { postApi } from "../Util/apiControleur";

interface IngredientForm {
  name: string;
  quantity: string;
}

interface StepForm {
  description: string;
}

const RecipeModalForm = () => {
  const username = localStorage.getItem("username") || undefined
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [formData, setFormData] = useState({
    author: user ? user.name : '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    title: '',
    category: '',
    servings: 1,
    cookTime: 1,
    description: '',
    ingredients: [] as IngredientForm[],
    steps: [] as StepForm[],
  });

  const initialFormData = {
    author: user ? user.name : '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    title: '',
    category: '',
    servings: 1,
    cookTime: 1,
    description: '',
    ingredients: [] as IngredientForm[],
    steps: [] as StepForm[],
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

    const recipeData = {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      cookTime: formData.cookTime.toString(),
      userId: +(localStorage.getItem("userId") || '0'),
      category: formData.category,
      servings: formData.servings.toString(),
      date: formData.date,
      ingredients: formData.ingredients.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.quantity }), {}),
      steps: formData.steps.map(step => step.description)
    };
  
    try {
      const response = await postApi('recipes', recipeData);
      const data = await response.json();
      setFormData({...initialFormData})
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
              type="text"
              name="author"
              value={username}
              placeholder="Author"
              readOnly
            />
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
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
            />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
            />

            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              <option value="Pizza">Pizza</option>
              <option value="Burger">Burger</option>
              <option value="Nouille">Nouille</option>
              <option value="Viande">Viande</option>
              <option value="Dessert">Dessert</option>
              <option value="Autre">Autre</option>
            </select>
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
                    placeholder="Ingredient name"
                  />
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddIngredient}>Add Ingredient</button>
            </div>
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
              <button type="button" onClick={handleAddStep}>Add Step</button>
            </div>
          </div>
        </div>
        <button type="submit" className="submit">Submit</button>
      </form>
    </div>
  );
};

export default RecipeModalForm;