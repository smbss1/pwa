import React from 'react';
import './RecipeDetailsModal.css'
import { Link } from 'react-router-dom';

interface RecipeDetailsModalProps {
  recipe: {
    auteur: string;
    imageUrl: string;
    title: string;
    description: string;
    ingredients: {
      [key: string]: number | string;
    };
    steps: {
      [step: number]: string;
    };
    cookTime: string;
    likes: number;
    category: string;
    date: Date;
    userId: number;
  };
  onClose: () => void;
}

const RecipeDetailsModal: React.FC<RecipeDetailsModalProps> = ({ recipe, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
      <button className="modal-close-button" onClick={onClose}>×</button>
        <div className="modal-content-left">
        <div className="modal-body">
            <p>{recipe.description}</p>
            <p><strong>Ingrédients:</strong></p>
            <ul>
              {Object.entries(recipe.ingredients).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
            <p><strong>Étapes:</strong></p>
            <ol>
              {Object.entries(recipe.steps).map(([step, description]) => (
                <li key={step}>{description}</li>
              ))}
            </ol>
          </div>
        
        </div>
        <div className='modal-content-right'>
          <div className="modal-img">
                <img src={recipe.imageUrl} alt={recipe.title} />
              </div>
          <div className="modal-header">
            <h1 className="text-center">{recipe.title}</h1>
            <h4 className="text-center">Par <Link to={`/profile/${recipe.auteur}/${recipe.userId}`} className='author'>{recipe.auteur}</Link></h4>
          </div>
          <p><strong>J'aime:</strong> {recipe.likes}</p>
          <p>ajouté le {recipe.date.toLocaleDateString()}</p>
        </div>
        <div className="modal-footer">
          {/* Boutons ou autres actions */}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsModal;
