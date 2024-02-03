import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { faUtensils, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../Components/Navbar";
import RecipeDetailsModal from "../Components/RecipeDetailsModal";
import RecipeCard from "../Components/RecipeCard";
import RecipeModalForm from "../Components/RecipeModalForm";
import Modal from "../Components/Modal";
import "./ProfilePage.css";
import { getApi } from "../Util/apiControleur";

const MyPage = () => {
    interface Recipe {
        id: number;
        auteur: string; // Ajout de la propriété 'auteur'
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

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { author } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const fetchData = async () => {
      try {
        const response = await getApi(`recipes/users/${userId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const recipesWithAuthor = data.map(recipe => ({
            ...recipe,
            auteur: recipe.author.username, // Assume `author` is already part of each recipe object.
          }));
          setRecipes(recipesWithAuthor);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.error('There was an error!', error);
        setRecipes([]);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="page-profile">
      <Navbar />
      <div className="header">
        <img src="/cuisto.png" alt="cuisto" />
        <h1>{author}</h1>
      </div>
      <div className="content-home">
        <button className="btnCreateRecipe" onClick={openModal}>Créer une recette</button>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <RecipeModalForm />
        </Modal>
        <div className="pad">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="results">
                {recipes && recipes.length > 0 ? (
                    recipes.map((recipe, index) => (
                    <RecipeCard
                        key={index}
                        imageUrl={recipe.imageUrl}
                        title={recipe.title}
                        description={recipe.description}
                        cookTime={recipe.cookTime}
                        likes={recipe.likes}
                        onCardClick={() => handleCardClick(recipe)}
                    />
                    ))
                ) : (
                    <p>Aucune recette trouvée</p>
                )}
                </div>
                {selectedRecipe && (
                <RecipeDetailsModal
                    recipe={{ ...selectedRecipe, date: new Date(selectedRecipe.date) }}
                    onClose={() => setSelectedRecipe(null)}
                />
                )}
            </div>
        </div> 
    </div>
  );
};

export default MyPage;
